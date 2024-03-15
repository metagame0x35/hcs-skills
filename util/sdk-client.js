const path = require('node:path');
const dotenv = require('dotenv');
const {
  AccountId,
  PrivateKey,
  Client,
} = require('@hashgraph/sdk');

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

// Configure accounts and client, and generate needed keys
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_PRIVATE_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

module.exports = {
  client,
  operatorId,
  operatorKey,
};
