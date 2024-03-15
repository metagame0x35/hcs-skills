const express = require('express');
const { topicCreate } = require('./topic-create.js');
const { topicGet } = require('./topic-get.js');

const server = express();

server.get('/api/v1/topic/create', async (req, res) => {
  try {
    const result = await topicCreate();
    res.status(200).json(result).send();
  } catch (ex) {
    console.error((new Date()).toISOString(), ex);
    res.status(400).send();
  }
});

server.get('/api/v1/topic/get', async (req, res) => {
  try {
    const result = await topicGet();
    res.status(200).json(result).send();
  } catch (ex) {
    console.error((new Date()).toISOString(), ex);
    res.status(400).send();
  }
});

module.exports = server;
