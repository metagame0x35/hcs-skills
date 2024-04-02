const {
  httpServer,
  wsServer,
} = require('./server.js');

const portNumber = 3113;

// HTTP server starts and listens on port number
httpServer.listen(portNumber, () => {
  console.log(`Listening on port ${portNumber}`);
});

// WS server also starts and listens on same port number
// Note that both use the same underlying implementation
wsServer.attach(httpServer);
