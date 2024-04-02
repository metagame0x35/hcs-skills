const socket = io('/');

socket.on('connect', function() {
  console.log('Connected to the web sockets server');
});

const data = {
  type: 'hcs-skill/v1',
  topicId: '',
  socketIdPrevious: '',
  socketId: '',
};

// Subscribe to an existing topic
async function subExistingTopic() {
  const textInputTopicId = document.getElementById('textInputTopicId').value;
  if (!textInputTopicId) {
    alert('Please enter a topic ID to subscribe to.');
    return;
  }

  // NOTE: Subscribe to topic
  // Step (12) in the accompanying tutorial
  const response = await fetch(
    /* ... */,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    const message = `An error occurred: ${response.statusText}`;
    throw new Error(message);
  }

  const result = await response.json();

  data.topicId = textInputTopicId;

  updateSubscribedTopic();
}

// Create a new topic, then subscribe to it (by invoking `subExistingTopic`)
async function subNewTopic() {
  const response = await fetch(
    '/api/v1/topic/create',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    const message = `An error occurred: ${response.statusText}`;
    throw new Error(message);
  }

  const result = await response.json();

  const inputTopicId = document.getElementById('textInputTopicId');
  inputTopicId.value = result.topicId;

  subExistingTopic();
}

function updateSubscribedTopic() {
  // Immediate UI display update
  const newTopicId = document.getElementById('newTopicId');
  newTopicId.innerHTML = `<b>Topic ID: ${data.topicId}</b>`;

  // unsubscribe from listening to previous topic,
  // and subscribe to listening to new topic instead.
  data.socketIdPrevious = data.socketId;
  data.socketId = `hcs-skill-${data.topicId}`;
  if (!!data.socketIdPrevious) {
    console.log(`Unsubscribing from socket ID ${data.socketIdPrevious}`);
    socket.off(data.socketIdPrevious, onSocketHcsSkill);
  }
    console.log(`Subscribing to socket ID ${data.socketId}`);
    socket.on(data.socketId, onSocketHcsSkill);
}

function onSocketHcsSkill(msg) {
  console.log('Received HCS Skill:', msg);
  // TODO add client-side verification
  addMessage(JSON.parse(msg));
}

// Send message to server, which will relay to HCS topic
async function submitToHedera() {
  const textInputSkill = document.getElementById('textInputSkill').value;
  const textInputUsername = document.getElementById('textInputUsername').value;
  const textInputAccountId = document.getElementById('textInputAccountId').value;
  if (!textInputSkill || !textInputUsername || !textInputAccountId) {
    alert('Please enter some text to submit.');
    return;
  }

  const response = await fetch(
    `/api/v1/message/create/${data.topicId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: data.type,
        accountId: textInputAccountId,
        skillName: textInputSkill,
        userName: textInputUsername,
      }),
    },
  );

  if (!response.ok) {
    const message = `An error occurred: ${response.statusText}`;
    throw new Error(message);
  }

  const result = await response.json(); // Assuming the server responds with JSON
  document.getElementById('textInputSkill').value = ''; // Clear the input field
  document.getElementById('textInputUsername').value = ''; // Clear the input field
  document.getElementById('textInputAccountId').value = ''; // Clear the input field
}

// Parse a received skill (from the HCS topic), and display that in the UI
function addMessage(message) {
  const tableBody = document
    .getElementById('messagesTable')
    .getElementsByTagName('tbody')[0];

  const newRow = tableBody.insertRow();

  // Creating a new cell for each piece of information and appending it
  const skillNameCell = newRow.insertCell(0);
  const skillNameText = document.createTextNode(message.skillName);
  skillNameCell.appendChild(skillNameText);

  const userNameCell = newRow.insertCell(1);
  const userNameText = document.createTextNode(message.userName);
  userNameCell.appendChild(userNameText);

  const accountIdCell = newRow.insertCell(2);
  const accountIdText = document.createTextNode(message.accountId);
  accountIdCell.appendChild(accountIdText);

  const typeCell = newRow.insertCell(3);
  const typeText = document.createTextNode(message.type);
  typeCell.appendChild(typeText);

  const hashCell = newRow.insertCell(4);
  hashCell.title = message.hash;
  const hashText = document.createTextNode(`${message.hash.substr(0, 6)}…`);
  hashCell.appendChild(hashText);
}
