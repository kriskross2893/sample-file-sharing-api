
import Sequelize from 'sequelize';
import uuid from 'uuid';
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

nacl.util = util;

module.exports = (sequelize, DataTypes) => {
  class StoredFile extends Sequelize.Model {
    static generateKeyPair() {
      const {
        publicKey,
        secretKey,
      } = nacl.box.keyPair();

      const encodedPublicKey = nacl.util.encodeBase64(publicKey);
      const encodedSecretKey = nacl.util.encodeBase64(secretKey);

      return {
        publicKey: encodedPublicKey,
        privateKey: encodedSecretKey,
      };
    }
  };
  /**
   * DB Model that will store the stored file information
   */
  StoredFile.init({
    /**
     * The unique file ID
     */
    fileId: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true,
      defaultValue: uuid,
    },
    /**
     * The name of the file
     */
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    /**
     * Absolute address of the file
     */
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    /**
     * Size of the file stored in MB
     */
    fileSizeMB: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    /**
     * The public key used for retrieval
     */
    publicKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    /**
     * The private key used for deleting
     */
    privateKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    /**
     * Determines if the stored file was deleted
     */
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'StoredFile',
    tableName: 'stored_file',
    underscored: true,
    timestamps: true,
  });

  return StoredFile;
};
