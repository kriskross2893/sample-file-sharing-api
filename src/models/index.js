import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import debugLib from 'debug';

import DBOptions from '../config/db';

const debug = debugLib('file-sharing-api:database');

let basename = path.basename(module.filename);

/**
 * Create a connection to the database
 * @returns {*} database connection
 */
function makeConnection() {
  debug('Connected to sqlite "in memory database" via Sequelize...');
  return new Sequelize('', null, null, DBOptions.SQLite);
};

/**
 * Reads all models in the current directory and imports them into sequelize
 * @param {Sequelize} sequelize - sequelize
 */
function readModels(sequelize) {
  let models = {};

  fs.readdirSync(__dirname)
    .filter(function(file) {
      return (file.indexOf('.') !== 0 && (file !== basename));
    })

    .forEach(function(file) {
      if (file.slice(-3) !== '.js') {
        return;
      }
      const filePath = path.join(__dirname, file);
      const model = sequelize.import(filePath);
      models[model.name] = model;
    });

  return models;
};

const sequelize = makeConnection();
const db = readModels(sequelize);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.connect = (callback) => {
  return sequelize
    .sync()
    .then(callback);
};

export default db;
