#!/usr/bin/env node

const { client } = require('../util/sdk-client.js');
const { skillPublish } = require('../front/skill-publish.js');
const {
  skillGetAll,
  skillSubscribe,
} = require('../front/skill-subscribe.js');

async function main() {

  const result0 = {
    validCount: 0,
    invalidCount: 0,
  };
  await skillGetAll('0.0.3745107', (err, result) => {
    if (err) {
      result0.invalidCount++;
    } else if (result) {
      result0.validCount++;
    }
  });
  console.log('skillGetAll message counts:');
  console.log(result0);

  const result1 = {
    validCount: 0,
    invalidCount: 0,
  };
  await skillSubscribe('0.0.3745107', (err, result) => {
    if (err) {
      result1.invalidCount++;
    } else if (result) {
      result1.validCount++;
    }
  });
  await skillPublish('0.0.3745107', 'aTestUser', 'aTestSkill');
  console.log('Waiting 5s...');
  await new Promise((resolve) => { setTimeout(resolve, 5_000) });
  console.log('skillSubscribe message counts:');
  console.log(result1);

  client.close();
}

main();
