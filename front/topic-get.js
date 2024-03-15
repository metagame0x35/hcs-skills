const {
  TopicId,
} = require('@hashgraph/sdk');

async function topicGet() {
  const topicGetResult = await fetch('http://localhost:3113/api/v1/topic/get');
  let topicIdString = topicGetResult.topicId;
  if (!topicIdString) {
    console.error('No topic ID');
    return null;
  }
  const topicId = TopicId.fromString(topicIdString);
  return topicId;
}

module.exports = {
  topicGet,
};
