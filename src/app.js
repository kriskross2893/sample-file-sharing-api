import express from 'express';
import debugLib from 'debug';
import multer from 'multer';

import './config/config';
import files from './routes/files';
import db from './models';

const port = process.env.PORT;
const host = process.env.HOST;

const debug = debugLib('file-sharing-api:server');
const upload = multer();

const app = express();

app.get('/', function(req, res) {
  res.send('Hello World');
});

// all routes after this will be able to parse multipart/form-data
app.use(upload.array());
app.use('/files', files);

let listener;
export const startApp = callback => {
  db.connect(() => {
    listener = app.listen(port, host, async() => {
      if (callback) {
        callback(db);
      }
      const address = listener.address().address;
      debug(`Server listening on http://[${address}]:${port} (PID ${process.pid})`);
    });
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
