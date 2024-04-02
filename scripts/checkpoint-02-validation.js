#!/usr/bin/env node

const { client } = require('../util/sdk-client.js');
const { skillVerify } = require('../util/skill-verify.js');

// failure - unsupported schema
const obj0 = {
  type: 'some-other-type/v1',
  accountId: '0.0.12345',
  userName: 'fake user',
  skillName: 'fake skill',
  hash: '9c17fcc378e286b2d4bcf693110fd53252eb23144818df21d86f6cdbc1c931a4',
};

// failure - skillName too short
const obj1 = {
  type: 'hcs-skill/v1',
  accountId: '0.0.12345',
  userName: 'fake user',
  skillName: '-',
  hash: '9c17fcc378e286b2d4bcf693110fd53252eb23144818df21d86f6cdbc1c931a4',
};

// failure - hash mismatch
const obj2 = {
  type: 'hcs-skill/v1',
  accountId: '0.0.12345',
  userName: 'fake user',
  skillName: 'fake skill',
  hash: '9c17fcc378e286b2d4bcf693110fd53252eb23144818df21d86f6cdbc1c931a4',
};

// pass validation!
const obj3 = {
  type: 'hcs-skill/v1',
  accountId: '0.0.12345',
  userName: 'fake user',
  skillName: 'fake skill',
  hash: '81e3b744163404b9a0581547aa243fe2f12e86a1f72056512380a0429c76ef56',
};

console.log('Note: Expect 3 validation failures, followed by 1 validation success.');
([obj0, obj1, obj2, obj3]).forEach((obj, idx) => {
  console.log(`Object #${idx}:`);
  const result = skillVerify(obj);
  if (!result) {
    console.log('Validation success!');
  } else {
    console.error('Validation failure.');
    console.log(result);
  }
});

client.close();
