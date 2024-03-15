#!/usr/bin/env node

const { client } = require('../util/sdk-client.js');
const { skillPublish } = require('../front/skill-publish.js');

async function main() {
  console.log('Expect validation error:');
  try {
    await skillPublish('0.0.3745107', 'testUser', '-');
  } catch (ex) {
    console.log(ex.message);
  }

  console.log('Expect success status (22) + hash:');
  const result0 = await skillPublish('0.0.3745107', 'testUser', 'testSkill');
  console.log(result0.status);
  console.log(result0.hash);

  client.close();
}

main();
