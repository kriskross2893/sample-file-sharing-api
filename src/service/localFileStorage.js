import fs from 'fs';
import formidable from 'formidable';

import db from '../models';
import getIPAddress from '../util/getIPAddress';

const {
  FOLDER,
  UPLOAD_LIMIT,
  DOWNLOAD_LIMIT,
} = process.env;

const MB_TO_B = 1048576;
const DEFAULT_CONFIG = {
  maxFileSize: UPLOAD_LIMIT * MB_TO_B,
  keepExtensions: true,
  uploadDir: FOLDER,
};

/**
 * Uploads file to file storage and keeps a record of the file in the database.
 * Calls the http callback to send the response
 * @param {Request} request - http request
 * @param {Function} callback - http response ballback
 * @throws {Error} - if file could not be saved in file storage or file size exceeds max allowed upload for the day
 */
async function uploadFile(request, callback) {
  const ip = getIPAddress(request);

  let lead = await db.Lead.findOne({
    where: {
      ipAddress: ip,
      isDeleted: false,
    },
  });
  const today = moment();
  let balance = 0;

  // retrieve available upload balance from the user
  if (lead) {
    if (today.isAfter(lead.lastUploadDate)) {
      lead.lastUploadDate = today;
      lead.uploadBalance = balance;
    } else {
      balance = lead.uploadBalance * MB_TO_B;
    }
  } else {
    lead = await db.Lead.create({
      ipAddress: ip,
      lastUploadDate: today,
      lastDownloadDate: today,
      uploadBalance: 0,
      downloadBalance: 0,
    });
  }

  const form = new formidable({
    ...DEFAULT_CONFIG,
    maxFileSize: DEFAULT_CONFIG.maxFileSize - balance,
  });

  form.parse(request, (err, fields, files) => {
    if (err) {
      callback(err, null);
      return;
    } else {
      const {
        path: fileUrl,
        name: fileName,
        type: fileType,
        size: fileSize,
      } = files[0];

      const {publicKey, privateKey} = db.StoredFile.generateKeyPair();

      // update upload balance
      lead.uploadBalance = (lead.uploadBalance + fileSize) / MB_TO_B;
      lead.save();

      // store file details in database
      db.StoredFile.create({
        fileUrl,
        fileName,
        fileType,
        fileSizeMB: (fileSize / MB_TO_B),
        publicKey,
        privateKey,
      }).then(() => {
        callback(null, {publicKey, privateKey});
      }).catch((err) => {
        callback(err, null);
      });
    }
  });

}

/**
 * Removes a file from the file storage
 * @param {String} privateKey - private key of stored file
 * @returns {Boolean} - true if the file was removed successfully, false if otherwise
 * @throws {Error} - file not found error if there was no such file found in record
 */
async function deleteFile(privateKey) {
  const storedFile = await db.StoredFile.findOne({
    where: {
      privateKey,
      isDeleted: false,
    },
  });

  if (!storedFile) {
    throw new Error('File not found');
  }

  // check if file exists
  const stats = fs.statSync(storedFile.fileUrl);

  // if file exists then remove and update db record
  if (stats.isFile()) {
    fs.unlinkSync(storedFile.fileUrl);

    storedFile.isDeleted = true;
    storedFile.save();
    return true;
  }

  return false;
}

/**
 * Retrieves file given the public key. The IP is used to determine if the user has
 * enough download credits to download the file
 * @param {String} publicKey - the public key of the stored file
 * @param {String} ip - ip address of the user
 * @returns {Object} - returns an object containing the file url (fileUrl)
 * @throws {Error} - when file is not found or download limit has exceeded
 */
async function getFile(publicKey, ip) {
  const storedFile = await db.StoredFile.findOne({
    where: {
      publicKey,
      isDeleted: false,
    },
  });

  if (!storedFile) {
    throw new Error('File not found');
  }

  const lead = await db.Lead.findOne({
    where: {
      ipAddress: ip,
    },
  });

  const today = moment();
  let balance = 0;

  if (lead) {
    if (today.isAfter(lead.lastDownloadDate)) {
      lead.lastDownloadDate = today;
      lead.downloadBalance = 0;
    } else {
      balance = lead.downloadBalance * MB_TO_B;
    }
  } else {
    lead = await db.Lead.create({
      ipAddress: ip,
      lastUploadDate: today,
      lastDownloadDate: today,
      uploadBalance: 0,
      downloadBalance: 0,
    });
  }

  const totalDownloadBalance = balance + (storedFile.fileSizeMB * MB_TO_B);

  if (totalDownloadBalance > (DOWNLOAD_LIMIT * MB_TO_B)) {
    throw new Error('Exceeded maximum allocated download limit');
  } else {
    lead.downloadBalance = totalDownloadBalance/MB_TO_B;
    lead.save();
    return {fileUrl: lead.fileUrl};
  }
}

module.exports = {
  uploadFile,
  deleteFile,
  getFile,
};
