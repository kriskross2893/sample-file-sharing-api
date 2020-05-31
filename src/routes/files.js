import express from 'express';
import debugLib from 'debug';

import files from '../lib/files';
import localFileStorage from '../service/localFileStorage';

const router = express.Router();
const debug = debugLib('file-sharing-api:files-route');

/**
 * Retrieves files from the file system
 */
router.get('/:publicKey', async (req, res) => {
  const ip = (
    req.headers['x-forwarded-for']
    || req.connection.remoteAddress
    || '')
    .split(',')[0]
    .trim();

  const {publicKey} = req.params;

  if (!publicKey) {
    res.status(404);
    res.json({
      message: 'No file key provided',
    });
    res.end();
    return;
  }

  try {
    const {fileUrl} = await localFileStorage.getFile(publicKey, ip);

    res.sendFile(fileUrl);
    res.end();
  } catch (error) {
    debug(error);
    res.status(500);
    res.json({
      message: error.message,
    });
  }
});

/**
 * Deletes files from the file system
 */
router.delete('/:privateKey', async (req, res) => {
  const {privateKey} = req.params;

  if (!privateKey) {
    res.status(404);
    res.json({
      message: 'No file key provided',
    });
    res.end();
    return;
  }

  try {
    const response = await files.deleteFile(privateKey);

    let message = response
      ? 'File successfully deleted.'
      : 'File was already deleted';

    res.json({message});
    res.end();
  } catch (error) {
    debug(error);
    res.status(500);
    res.json({
      message: 'Could not delete file. Please try again later',
    });
    res.end();
  }
});

/**
 * Creates a new file in the file system
 */
router.post('/', async (req, res) => {
  const callback = (err, {publicKey, privateKey}) => {
    if (err) {
      res.status(500);
      res.json({
        message: 'Could not upload file. Please try again later,',
        error: err.message,
      });
      res.end();
    } else {
      res.json({
        publicKey,
        privateKey,
      });
      res.end();
    }
  };

  try {
    await localFileStorage.uploadFile(req, callback);
  } catch (error) {
    debug(error);
    res.status(500);
    res.json({
      message: 'Could not upload file. Please try again later.',
    });
    res.end();
  }

});

export default router;
