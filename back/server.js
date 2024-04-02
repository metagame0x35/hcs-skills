const http = require('node:http');
const path = require('node:path');

const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const { topicCreate } = require('./topic-create.js');
const { topicGet } = require('./topic-get.js');
const { subscribeToTopic } = require('./subscribe-to-topic.js');
const { messageCreate } = require('./message-create.js');

const server = express();

// Middleware for all routes

const corsOptions = {
  origin: true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
};
server.use(cors(corsOptions));
// server.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*'); // allows requests from any origin
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept',
//   );
//   next();
// });
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

// API routes

server.get('/api/v1/topic/get', async (req, res) => {
  try {
    const result = await topicGet();
    res.status(200).json(result);
  } catch (ex) {
    console.error(new Date().toISOString(), ex);
    res.status(400).send();
  }
});

server.get('/api/v1/topic/create', async (req, res) => {
  try {
    const result = await topicCreate();
    res.status(200).json(result);
  } catch (ex) {
    console.error(new Date().toISOString(), ex);
    res.status(400).send();
  }
});

server.get('/api/v1/topic/subscribe/:topicId', async (req, res) => {
  try {
    await subscribeToTopic(wsServer, req.params.topicId);
    res.status(200).json({});
  } catch (ex) {
    console.error(new Date().toISOString(), ex);
    res.status(400).send();
  }
});

server.post('/api/v1/message/create/:topicId?', async (req, res) => {
  try {
    const result = await messageCreate(req.body, req.params.topicId);
    res.status(200).json(result);
  } catch (ex) {
    console.error(new Date().toISOString(), ex);
    res.status(400).send();
  }
});

// fallback route to serve static files

server.use(express.static(path.resolve(__dirname, '../front')));

// initialise both the HTTP and WS servers.
// however, they do not start running/ listening yet -
// that happens in 'server-run.js';

const httpServer = http.createServer(server);
const wsServer = new Server(
  {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  }
);

function getServers () {
  return {
    server,
    httpServer,
    wsServer,
  };
}

module.exports = {
  server,
  httpServer,
  wsServer,
  getServers,
};
