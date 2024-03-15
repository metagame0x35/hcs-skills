#!/usr/bin/env node

const { client } = require('../util/sdk-client.js');
const topicCreate = require('../back/topic-create.js');
const topicGet = require('../back/topic-get.js');

async function main() {
  const result1 = await topicGet.topicGet();
  console.log('result 1 - topic get:', result1);

  const result2 = await topicCreate.topicCreate();
  console.log('result 2 - topic create:', result2);

  const result3 = await topicCreate.topicCreate();
  console.log('result 3 - topic create:', result3);

  const result4 = await topicGet.topicGet();
  console.log('result 4 - topic get:', result4);

  await client.close();
}

main();
