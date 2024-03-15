const {
  TopicId,
  TopicMessageQuery,
} = require('@hashgraph/sdk');

const {
  client,
  operatorId,
} = require('../util/sdk-client.js');
const { skillVerify } = require('./skill-verify.js');
const {
  deserialise,
  removeHash,
} = require('../util/objects.js');

function parseSkill(msgBin, format, callback) {
  const msgStr = Buffer.from(msgBin, format).toString();
  const obj = deserialise(msgStr);
  const validationErrors = skillVerify(obj);
  if (validationErrors) {
    callback(validationErrors, obj);
  } else {
    callback(undefined, removeHash(obj));
  }
}

// list all skills previously added to the topic
async function skillGetAll(topicId, callback) {
  if (typeof topicId === 'string') {
    topicId = TopicId.fromString(topicId);
  }

  // NOTE: Mirror Node query of HCS topic
  // Step (NNN) in the accompanying tutorial
  const mirrorNodeUrl =
    `https://testnet.mirrornode.hedera.com/api/v1/topics/${/* ... */}/messages`;
  const fetchResponse = /* ... */;
  const response = await fetchResponse.json();
  response.messages.forEach((msgBin) => parseSkill(msgBin.message, 'base64', callback));
}

// listen for new skills being added to the topic
async function skillSubscribe(topicId, callback) {
  if (typeof topicId === 'string') {
    topicId = TopicId.fromString(topicId);
  }

  // NOTE: Subscribe to HCS topic
  // Step (NNN) in the accompanying tutorial
  /* ... */;
}

module.exports = {
  skillGetAll,
  skillSubscribe,
};
