const topicPersist = require('./topic-persist.js');

async function topicGet() {
  const topicId = await topicPersist.read();
  const topicIdString = (!!topicId) ?
    topicId.toString() :
    null;
  return {
    topicId: topicIdString,
  };
}

module.exports = {
  topicGet,
};
