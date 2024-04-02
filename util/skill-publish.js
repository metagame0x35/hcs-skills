const {
  TopicId,
  TopicMessageSubmitTransaction,
} = require('@hashgraph/sdk');

const { client } = require('./sdk-client.js');
const { skillVerify } = require('./skill-verify.js');
const {
  addHash,
  serialise,
} = require('./objects.js');

async function skillPublish(topicId, accountId, userName, skillName) {
  if (typeof topicId === 'string') {
    topicId = TopicId.fromString(topicId);
  }

  const skillData = {
    type: 'hcs-skill/v1',
    accountId,
    userName,
    skillName,
  };

  // NOTE: Add hash to message
  // Step (7) in the accompanying tutorial
  const obj = /* ... */;

  // NOTE: Verify message
  // Step (8) in the accompanying tutorial
  const validationErrors = /* ... */;
  if (validationErrors) {
    console.error(validationErrors);
    throw new Error('skill validation failed');
  }

  // NOTE: Submit message to HCS topic
  // Step (9) in the accompanying tutorial
  const hcsMsg = serialise(obj);
  const topicMsgSubmitTx = await new TopicMessageSubmitTransaction(/* ... */).execute(client);

  const topicMsgSubmitReceipt = await topicMsgSubmitTx.getReceipt(client);

  return {
    status: topicMsgSubmitReceipt.status,
    seqNum: topicMsgSubmitReceipt.topicSequenceNumber,
    operatorId: topicMsgSubmitReceipt.operatorId,
    skillData,
    hash: obj.hash,
  };
}

module.exports = {
  skillPublish,
};
