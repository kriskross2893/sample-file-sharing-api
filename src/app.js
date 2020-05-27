import express from 'express';
import debugLib from 'debug';

import './config';

const port = process.env.PORT;
const host = process.env.HOST;

const debug = debugLib('file-sharing-api:server');

const app = express();

app.get('/', function(req, res) {
  res.send('Hello World');
});

// app.use(authGuard);

let listener;
export const startApp = callback => {
  listener = app.listen(port, host, async() => {
    if (callback) {
      callback();
    }
    const address = listener.address().address;
    debug(`Server listening on http://[${address}]:${port} (PID ${process.pid})`);
  });
};

export const stopApp = callback => {
  return listener.close(callback);
};

export const getListener = () => {
  return listener;
};

if (require.main === module) {
  startApp();
}

export default startApp;
