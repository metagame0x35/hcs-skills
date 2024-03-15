const {
  TopicCreateTransaction,
} = require('@hashgraph/sdk');

const {
  topicGet,
} = require('./topic-get.js');
const topicPersist = require('./topic-persist.js');

const {
  client,
  operatorId,
} = require('../util/sdk-client.js');

async function topicCreateRaw() {
  let txResponse = await new TopicCreateTransaction().execute(client);
  let receipt = await txResponse.getReceipt(client);
  let topicId = receipt.topicId;
  topicPersist.create(topicId);
  return {
    operatorId: operatorId.toString(),
    topicId,
  };
}

async function topicCreate() {
  let { topicId } = await topicGet();
  const usedCache = !!topicId;
  if (!usedCache) {
    topicId = (await topicCreateRaw()).topicId.toString();
  }
  return {
    operatorId: operatorId.toString(),
    topicId,
    usedCache,
  };
}

module.exports = {
  topicCreateRaw,
  topicCreate,
};
