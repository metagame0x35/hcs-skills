const {
  TopicMessageSubmitTransaction,
} = require('@hashgraph/sdk');

const {
  topicGet,
} = require('./topic-get.js');

const { skillPublish } = require('../util/skill-publish.js');

async function messageCreate(msgObject, topicIdReq) {
  const topicId = topicIdReq || (await topicGet()).topicId;
  if (!topicId) {
    console.error('No topic ID');
    return null;
  }

  const result = await skillPublish(
    topicId,
    msgObject.accountId,
    msgObject.userName,
    msgObject.skillName,
  );

  return result;
}

module.exports = {
  messageCreate,
};
