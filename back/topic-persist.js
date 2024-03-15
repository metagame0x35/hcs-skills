// TODO replace in memeory persistence with files or databases
// TODO handle de/serialisation

const store = {
  topicId: undefined,
};

async function create(topicId) {
  store.topicId = topicId;
}

async function read() {
  return store.topicId;
}

module.exports = {
  create,
  read,
};
