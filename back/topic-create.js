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
  // register a new Topic in HCS
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
    // delay returning the topic ID by several seconds
    // to give it time to propagate before it gets used in queries or subscribed to
    await new Promise((resolve) => setTimeout(resolve, 5000));
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
