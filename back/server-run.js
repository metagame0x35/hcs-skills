const server = require('./server.js');
const port = 3113;

server.listen(port, () => {
  console.log(`Listening on port ${port}`)
});
