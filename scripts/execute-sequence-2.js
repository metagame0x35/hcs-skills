#!/usr/bin/env node

const supertest = require('supertest');

const {
  TopicMessageSubmitTransaction,
} = require('@hashgraph/sdk');

const server = require('../back/server.js');
const { client } = require('../util/sdk-client.js');
const { serialise } = require('../util/objects.js');
const { skillPublish } = require('../front/skill-publish.js');
const {
  skillGetAll,
  skillSubscribe,
} = require('../front/skill-subscribe.js');

const request = supertest(server);

async function main() {
  const result1 = await request.get('/api/v1/topic/get');
  console.log('result 1 - topic get:', result1.status, result1.body);

  const result2 = await request.get('/api/v1/topic/create');
  console.log('result 2 - topic create:', result2.status, result2.body);

  const result3 = await request.get('/api/v1/topic/create');
  console.log('result 3 - topic create:', result3.status, result3.body);

  const result4 = await request.get('/api/v1/topic/get');
  console.log('result 4 - topic get:', result4.status, result4.body);

  const topicId = result4.body.topicId;
  console.log('Hashscan URL:', `https://hashscan.io/testnet/topic/${topicId}`);

  // Wait for HCS Topic creation to "settle" - cannot subscribe/ submit immediately after creation
  console.log('Waiting 5s...');
  await new Promise((resolve) => { setTimeout(resolve, 5_000) });

  function skillReadCallback(err, skill) {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Skill:', skill);
    }
  };

  console.log('Submitting 3x initial to topic:', topicId);
  await skillPublish(topicId, 'bguiz', 'Hello World - Create and fund account');
  await (async function() { // this will fail schema validation
    // construct fake skill message and submit to HCS topic
    const obj = {
      type: 'hcs-skill/v1',
      accountId: '0.0.12345',
      userName: 'fake',
      skillName: '-',
      hash: '9c17fcc378e286b2d4bcf693110fd53252eb23144818df21d86f6cdbc1c931a4',
    };
    await new TopicMessageSubmitTransaction({
      topicId: topicId,
      message: serialise(obj),
    }).execute(client);
  })();
  await skillPublish(topicId, 'bguiz', 'Hello World - Hedera Smart Contracts');

  // Wait for HCS Topic submissions
  console.log('Waiting 5s...');
  await new Promise((resolve) => { setTimeout(resolve, 5_000) });
  await skillGetAll(topicId, skillReadCallback);

  // Wait for HCS Topic submissions
  console.log('Waiting 5s...');
  await new Promise((resolve) => { setTimeout(resolve, 5_000) });

  console.log('Subscribing to topic:', topicId);
  await skillSubscribe(topicId, skillReadCallback);

  console.log('Submitting 3x additional to topic:', topicId);
  await skillPublish(topicId, 'bguiz', 'Hedera Consensus Service - demo app');
  await (async function() { // this will pass schema validation, but fail hash validation
    // construct fake skill message and submit to HCS topic
    const obj = {
      type: 'hcs-skill/v1',
      accountId: '0.0.12345',
      userName: 'fake user',
      skillName: 'fake skill',
      hash: '9c17fcc378e286b2d4bcf693110fd53252eb23144818df21d86f6cdbc1c931a4',
    };
    await new TopicMessageSubmitTransaction({
      topicId: topicId,
      message: serialise(obj),
    }).execute(client);
  })();
  await skillPublish(topicId, 'bguiz', 'Hello World - HTS Fungible Token');

  // Wait for HCS Topic Subscriptions to come through, they lag by several seconds
  console.log('Waiting 10s...');
  await new Promise((resolve) => { setTimeout(resolve, 10_000) });

  await client.close();
}

main();
