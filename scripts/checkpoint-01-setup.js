#!/usr/bin/env node

const path = require('node:path');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

async function main() {
  console.log('git check:');
  const gitRemoteCliExec = await exec('git remote -v');
  if (gitRemoteCliExec.stderr) {
    console.log('git error:');
    console.error(gitRemoteCliExec.stderr);
  } else if (!gitRemoteCliExec.stdout.match(/github\.com\:[a-z,A-Z,0-9,\-,\_]+\/hcs-skills\.git/gm)) {
    console.log('git remote mismatch:');
    console.error(gitRemoteCliExec.stdout);
  } else {
    console.log('OK!');
  }

  console.log('npm install check:');
  const npmLsCliExec = await exec('npm ls');
  if (npmLsCliExec.stderr) {
    console.log('npm error:');
    console.error(npmLsCliExec.stderr);
  } else if (!npmLsCliExec.stdout.match(/\@hashgraph\/sdk\@/gm)) {
    console.log('npm ls mismatch:');
    console.error(npmLsCliExec.stdout);
  } else {
    console.log('OK!');
  }

  console.log('.env file check:');
  dotEnvFilePath = path.resolve(__dirname, '../.env');
  const lsCliExec = await exec(`ls ${dotEnvFilePath}`);
  if (lsCliExec.stderr) {
    console.log('ls error:');
    console.error(lsCliExec.stderr);
  } else if (!lsCliExec.stdout.match(/\.env/gm)) {
    console.log('ls mismatch:');
    console.error(lsCliExec.stdout);
  } else {
    console.log('OK!');
  }
}

main();
