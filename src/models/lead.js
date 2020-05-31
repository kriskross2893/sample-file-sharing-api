
import Sequelize from 'sequelize';
import uuid from 'uuid';

module.exports = (sequelize, DataTypes) => {
  class Lead extends Sequelize.Model {};
  /**
   * DB Model that will store the stored file information
   */
  Lead.init({
    /**
     * The unique ID of the lead
     */
    leadId: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true,
      defaultValue: uuid,
    },
    /**
     * ip address of the lead
     */
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    /**
     * The amount of used MB for uploading
     */
    uploadBalance: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    /**
     * The amount of used MB for downloading
     */
    downloadBalance: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    /**
     * The date the lead last downloaded a file
     */
    lastDownloadDate: {
      type: DataTypes.DATEONLY,
    },
    /**
     * The date the lead last uploaded a file
     */
    lastUploadDate: {
      type: DataTypes.DATEONLY,
    },
  }, {
    sequelize,
    modelName: 'Lead',
    tableName: 'lead',
    underscored: true,
    timestamps: true,
  });

  return Lead;
};
