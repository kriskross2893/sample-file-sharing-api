
import Sequelize from 'sequelize';
import uuid from 'uuid';
import nacl from 'tweetnacl';

module.exports = (sequelize, DataTypes) => {
  class StoredFile extends Sequelize.Model {
    static generateKeyPair() {
      const {
        publicKey,
        secretKey: privateKey,
      } = nacl.box.keyPair();

      return {
        publicKey,
        privateKey,
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
