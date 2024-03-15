const {
  TopicId,
  TopicMessageSubmitTransaction,
} = require('@hashgraph/sdk');

const {
  client,
  operatorId,
} = require('../util/sdk-client.js');
const { skillVerify } = require('./skill-verify.js');
const {
  addHash,
  serialise,
} = require('../util/objects.js');

async function skillPublish(topicId, userName, skillName) {
  if (typeof topicId === 'string') {
    topicId = TopicId.fromString(topicId);
  }

  const skillData = {
    type: 'hcs-skill/v1',
    accountId: operatorId.toString(),
    userName,
    skillName,
  };

  // NOTE: Add hash to message
  // Step (NNN) in the accompanying tutorial
  const obj = /* ... */;

  // NOTE: Verify message
  // Step (NNN) in the accompanying tutorial
  const validationErrors = /* ... */;
  if (validationErrors) {
    console.error(validationErrors);
    throw new Error('skill validation failed');
  }

  // NOTE: Submit message to HCS topic
  // Step (NNN) in the accompanying tutorial
  const hcsMsg = serialise(obj);
  const topicMsgSubmitTx = /* ... */;

  const topicMsgSubmitReceipt = await topicMsgSubmitTx.getReceipt(client);

  return {
    status: topicMsgSubmitReceipt.status,
    seqNum: topicMsgSubmitReceipt.topicSequenceNumber,
    accountId: topicMsgSubmitReceipt.operatorId,
    skillData,
    hash: obj.hash,
  };
}

module.exports = {
  skillPublish,
};
