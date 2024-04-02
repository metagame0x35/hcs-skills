const {
  TopicMessageQuery,
} = require('@hashgraph/sdk');

const { topicGet } = require('./topic-get.js');
const {
  skillGetAll,
  skillSubscribe,
} = require('../util/skill-subscribe.js');

// key: topicId
// value: TopicMessageQuery (subscription)
const subscriptions = new Map();

async function getSubscription(topicId, wsServer) {
  const topicIdStr = topicId.toString();
  const socketId = `hcs-skill-${topicIdStr}`;

  // get all previously submitted skills for this topic
  await skillGetAll(topicIdStr, onGetSkillCallback);

  // Re-use existing TopicMessageQuery subscription if present.
  // Otherwise initialise a new one
  let subscription = subscriptions.get(topicIdStr);
  if (!subscription) {
    console.log(`Initialising new TopicMessageQuery subscription for ${topicId} relayed on socket ID ${socketId}`);

    try {
      subscription = await skillSubscribe(topicIdStr, onGetSkillCallback);
      subscriptions.set(topicIdStr, subscription);
      console.log('SUCCESS: TopicMessageQuery()', topicIdStr, socketId);
    } catch (error) {
      console.log('ERROR: TopicMessageQuery()', error);
      throw error;
    }
  }

  return subscription;

  function onGetSkillCallback(err, obj) {
    if (err) {
      console.error('Verification errors');
      console.log(err, obj);
      return;
    }
    wsServer.emit(socketId, JSON.stringify(obj));
  }
}

async function subscribeToTopic(wsServer, topicIdReq) {
  const topicId = topicIdReq || (await topicGet()).topicId;
  await getSubscription(topicId, wsServer);
}

module.exports = {
  subscribeToTopic,
};
