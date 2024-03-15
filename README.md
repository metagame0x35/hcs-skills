# HCS Skills

## What you will accomplish

- [ ] Create an application that interacts with Hedera Consensus Service (HCS)
- [ ] Use the Hedera SDK to create a new HCS Topic
- [ ] Use the Hedera SDK to publish/ subscribe messages to the HCS Topic
- [ ] Use the Hedera Mirror Node to retrieve historical messages from HCS Topic
- [ ] Use JSON Schema and hashes to validate messages retrieved from HCS

***

## Overview

You will be building an app that submits messages to a HCS Topic.
Each message looks something similar to this:

```json
{
  "type": "hcs-skill/v1",
  "accountId": "0.0.1521",
  "skillName": "Hello World - Create and fund account",
  "userName": "bguiz",
  "hash": "9c17fcc378e286b2d4bcf693110fd53252eb23144818df21d86f6cdbc1c931a4",
}
```

These messages will be verified using [JSON-schema](https://json-schema.org/), and also verified by checking that for a hash match.

In the user interface of the application, only messages that pass verification will be displayed. Those that do not pass verification will simply be filtered out.

To do all of this, you will make use of the following Hedera technologies:

- HAPIs via the [Hedera SDK](https://github.com/hashgraph/hedera-sdk-js)
  - `TopicCreateTransaction`
  - `TopicMessageSubmitTransaction`
  - `TopicMessageQuery`
- HTTP APIs via the [Hedera Mirror Node](https://testnet.mirrornode.hedera.com/api/v1/docs/)
  - `/api/v1/topics/{topicId}/messages`
- Manual verification via [Hashscan](https://hashscan.io/testnet/)

You will also make use of the following 3rd-party technologies:

- [`safe-stable-stringify`](https://www.npmjs.com/package/safe-stable-stringify) for data serialisation
- [`ajv`](https://www.npmjs.com/package/ajv) for JSON Schema verification
- [`express`](https://www.npmjs.com/package/express) for a simple web server
- [`node:crypto`](https://nodejs.org/api/crypto.html) for hashing

Naturally, this workshop will mostly focus on the Hedera technologies.

***

## Prerequisites

<details>

<summary>Also, you should have the following set up on your computer <strong>⬇</strong></summary>

* [x] POSIX-compliant shell
  * For Linux & Mac: The shell that ships with the operating system will work. Either `bash` or `zsh` will work.
  * For Windows: The shells that ship with the operating system (`cmd.exe`, `powershell.exe`) _will not_ work.
    * Recommended: `git-bash` which ships with `git-for-windows`. [Install Git for Windows (Git for Windows)](https://gitforwindows.org/)
    * Recommended (alternative): Windows Subsystem for Linux. [Install WSL (Microsoft)](https://learn.microsoft.com/en-us/windows/wsl/install)
* [x] `git` installed
  * Minimum version: 2.37
  * Recommended: [Install Git (Github)](https://github.com/git-guides/install-git)
* [x] A code editor or IDE
  * Recommended: VS Code. [Install VS Code (Visual Studio)](https://code.visualstudio.com/docs/setup/setup-overview)
* [x] NodeJs + `npm` installed
  * Minimum version of NodeJs: 20
  * Minimum version of `npm`: 9.5
  * Recommended for Linux & Mac: [`nvm`](https://github.com/nvm-sh/nvm)
  * Recommended for Windows: [`nvm-windows`](https://github.com/coreybutler/nvm-windows)

</details>

<details>

<summary>Check your prerequisites set up <strong>⬇</strong></summary>

Open your terminal, and enter the following commands.

```shell
bash --version
zsh --version
git --version
code --version
node --version
npm --version
```

Each of these commands should output some text that includes a version number, for example:

```
bash --version
GNU bash, version 3.2.57(1)-release (arm64-apple-darwin22)
Copyright (C) 2007 Free Software Foundation, Inc.

zsh --version
zsh 5.9 (x86_64-apple-darwin22.0)

git --version
git version 2.39.2 (Apple Git-143)

code --version
1.81.1
6c3e3dba23e8fadc360aed75ce363ba185c49794
arm64

node --version
v20.6.1

npm --version
9.8.1

```

If the output contains text similar to `command not found`, please install that item.

If the version number that is output is **lower** than the required versions, please re-install or update that item.

If the version number that is output is **same or higher** than the required versions, you have met the prerequisites! 🎉

</details>

***

## Workshop

### Set up

#### Step NNN: Set up git repo

To follow along, start with the `main` branch, which is the _default branch_ of this repo. This gives you the initial state from which you can follow along with the steps as described in the tutorial.

```shell
git clone https://github.com/hedera-dev/hcs-skills.git
```

<details>

<summary>Alternative with `git` and SSH</summary>

If you have [configured SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) to work with `git`, you may wish use this command instead:

```shell
git clone git@github.com:hedera-dev/hcs-skills.git
```

</details>

#### Step NNN: Install dependencies

Enter the `hcs-skills` directory.

```shell
cd hcs-skills/
```

Install the dependencies using `npm`.

```shell
npm install
```

#### Step NNN: Create your .env file

Make a `.env` file by copying the provided `.env.sample` file. Then open the `.env` file in a code editor, such as VS Code.

```shell
cp .env.sample .env
```

Then edit the `.env` file.

```shell
OPERATOR_ID=
OPERATOR_PRIVATE_KEY=
```

Fill in the values for the `OPERATOR_ID` and `OPERATOR_PRIVATE_KEY` with those from your Hedera Testnet account. If you do not have one yet, you may obtain one from the [Hedera developer portal](https://portal.hedera.com/register).

#### Checkpoint: Set up

Let's now check that the git repo, npm installation, and `.env` file have been set up properly. Run:

```shell
node scripts/checkpoint-setup.js
```

This should produce an output that indicates whether each of the above steps has been performed correctly.

<details>

<summary>Sample output <strong>⬇</strong></summary>

```text
git check:
OK!
npm install check:
OK!
.env file check:
OK!
```

</details>

You should see 3 `OK!` outputs. If not, please revisit those steps which indicate an error.

### Verify messages

#### Step NNN: Schema definition

Open `schemas/hcs-skill--v1.schema.json`. Looking at the `properties` object within the schema file, we see the following:

<details>

<summary>Schema file contents <strong>⬇</strong></summary>

```json
  "properties": {
    "type": {
      "const": "hcs-skill/v1"
    },
    "accountId": {
      "type": "string",
      "pattern": "^\\d+.\\d+.\\d+$"
    },
    "userName": {
      "type": "string",
      "minLength": 3,
      "maxLength": 100
    },
    "skillName": {
      "type": "string",
      "minLength": 3,
      "maxLength": 100
    },
    "hash": {
      "type": "string",
      "minLength": 64,
      "maxLength": 64
    }
  },
```

</details>

This defines the validation rules for the skills objects that you will submit to the HCS Topic.

#### Step NNN: Schema validation

Open `front/skill-verify.js`.

Look in the `skillVerify` function, and within that find the comment `// NOTE: Schema validation`.

At this point, the schema that we just looked at above has been read in, and compiled into a `validator` object, using `ajv`. Modify the statement to pass the `obj` as a parameter to the `validator`.

```js
const isValid = validator(obj);
```

#### Step NNN: Custom validation

Stay within `front/skill-verify.js`, and the `skillVerify` function. Find the comment `// NOTE: Custom validation` next.

At this point, the `obj.hash` has been recomputed, and we need to check if this hash matches the hash that was originally in the object.
Modify the condition of the `if` statement to do the following.

```js
obj.hash !== objWithUpdatedHash.hash
```

#### Checkpoint: Verify messages

Let's now check that the `skillVerify` function that we've just modified works as expected. Run:

```shell
node scripts/checkpoint-validation.js
```

This script attempts to validate 3 invalid objects, followed by 1 valid object.

This should produce an output that contains validation failures for the first 3 objects, and a validation success for the 4th (final) object.

<details>

<summary>Sample output <strong>⬇</strong></summary>

```text
Object #0:
Validation failure.
[
  {
    instancePath: '/type',
    message: 'unsupported schema: some-other-type/v1'
  }
]
Object #1:
Validation failure.
[
  {
    instancePath: '/skillName',
    schemaPath: '#/properties/skillName/minLength',
    keyword: 'minLength',
    params: { limit: 3 },
    message: 'must NOT have fewer than 3 characters'
  }
]
Object #2:
81e3b744163404b9a0581547aa243fe2f12e86a1f72056512380a0429c76ef56
Validation failure.
[ { instancePath: '/hash', message: 'hash mismatch' } ]
Object #3:
Validation success!
```

</details>

### Publish messages

#### Step NNN: Add hash to message

Open `front/skill-publish.js`.

Look in the `skillPublish` function, and within that find the comment `// NOTE: Add hash to message`.

Create an object named `obj` by invoking `addHash` on the `skillData` object.

```js
  const obj = addHash(skillData);
```

The `addHash` function is found within `util/objects.js`. It simply serialises an object as a string, then hashes it using the `sha256` hash function, and adds that hash to the original object. This has already been implemented for you, and no modification is necessary.

#### Step NNN: Verify message

Stay within `front/skill-publish.js`, and the `skillPublish` function. Find the comment `// NOTE: Verify message` next.

Before publishing the message, you will want to verify that it conforms to the required format of a skill object. To do so, invoke the `skillVerify` function completed previously, by passing in `obj`.

```js
  const validationErrors = skillVerify(obj);
```

This will return an array of validation errors, if there are any. The subsequent lines perform error handling, and blocks the message from being published if there is any error. This has already been implemented for you, and no modification is necessary.

#### Step NNN: Submit message to HCS topic

Stay within `front/skill-publish.js`, and the `skillPublish` function. Find the comment `// NOTE: Submit message to HCS topic` next.

Now you are finally ready to publish the message to the HCS topic. To do so, we send a `TopicMessageSubmitTransaction` to the network. As its name suggests, it submits a message to a HCS topic. Pass in `topicId` and `hcsMsg` as properties of this transaction.

```js
  const topicMsgSubmitTx = await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: hcsMsg,
  }).execute(client);
```

When `.execute(client)` is invoked on the transaction, the transaction is cryptographically signed using your account configured in the `.env` file, and then submitted to the network.

#### Checkpoint: Publish messages

Let's now check that the `skillPublish` function that we've just modified works as expected. Run:

```shell
node scripts/checkpoint-publish.js
```

This script attempts to publish a message that fails validation, and subsequently attempts to publish a message that passes validation.

This should produce an output that contains 1 rejection, followed by 1 successfully submitted message.

<details>

<summary>Sample output <strong>⬇</strong></summary>

```
Expect validation error:
[
  {
    instancePath: '/skillName',
    schemaPath: '#/properties/skillName/minLength',
    keyword: 'minLength',
    params: { limit: 3 },
    message: 'must NOT have fewer than 3 characters'
  }
]
skill validation failed
Expect success status + hash:
Status { _code: 22 }
68b0f367570ea93073a34755ec66a647a9776a09151fae1bf7d97157ec321e7c
```

</details>

### Read messages

#### Step NNN: Mirror Node query of HCS topic

Open `front/skill-subscribe.js`.

Look in the `skillGetAll` function, and within that find the comment `// NOTE: Mirror Node query of HCS topic`.

```js
  const mirrorNodeUrl =
    `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId.toString()}/messages`;
  const fetchResponse = await fetch(mirrorNodeUrl);
```

TODO

#### Step NNN: Subscribe to HCS topic

Stay within `front/skill-subscribe.js`, and look in the `skillSubscribe` function. Find the comment `// NOTE: Subscribe to HCS topic` next.

```js
  new TopicMessageQuery()
    .setTopicId(topicId)
    .subscribe(client, (msgBin) => parseSkill(msgBin.contents, 'utf8', callback));
```

TODO

#### Checkpoint: Read messages

Let's now check that the `skillGetAll` and `skillSubscribe` functions that we've just modified work as expected. Run:

```shell
node scripts/checkpoint-subscribe.js
```

This script invokes `skillGetAll` which queries all past messages on a HCS topic, and tallies how many of them are valid skill objects, and how many are not. The script also invokes `skillSubscribe`, and then immediately after invokes `skillPublish` (since `skillSubscribe` only tracks new messages on a HCS topic), then finally tallies how many of them are valid skill objects, and how many are not.

This should produce an output that contains counts for valid and invalid messages for both `skillGetAll` and `skillSubscribe`.

<details>

<summary>Sample output <strong>⬇</strong></summary>

```text
skillGetAll message counts:
{ validCount: 7, invalidCount: 2 }
Waiting 5s...
skillSubscribe message counts:
{ validCount: 1, invalidCount: 0 }
```

If you re-run the same script immediately after, you will notice that the `validCount` for `skillGetAll` increments by 1. The other values remain the same. This is because the script publishes a new valid message to the HCS topic each time it is run for the purposes of testing.

```text
skillGetAll message counts:
{ validCount: 8, invalidCount: 2 }
Waiting 5s...
skillPublish message counts:
{ validCount: 1, invalidCount: 0 }
```

</details>

### Wrap

Now you have a working application built on top of Hedera Consensus Service!

🎉🎉🎉

***

## Where to go from here

Possible stretch goals:

- **Easy**: Create a more detailed schema for specific use cases
  - For example: https://github.com/OpenCerts
- **Hard**: Modify `skillVerify` such that the `accountId` in the message matches the account that submitted the HCS transaction
- **Very hard**: Modify system to enable multiple schemas for different object types being published to the same schema, and to allow them to reference each other
  - For example: Define `person` and `skill` as separate entities, where there is a many-to-many relationship between the two.

***

## What you have accomplished

- [x] Create an application that interacts with Hedera Consensus Service (HCS)
- [x] Use the Hedera SDK to create a new HCS Topic
- [x] Use the Hedera SDK to publish/ subscribe messages to the HCS Topic
- [x] Use the Hedera Mirror Node to retrieve historical messages from HCS Topic
- [x] Use JSON Schema and hashes to validate messages retrieved from HCS

***

## Licence

Apache-2.0
