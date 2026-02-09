const { DataTypes } = require('sequelize');
const shortId = require('shortid');
const { sequelize } = require('../config/database');

const URL = sequelize.define('URL', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  originalUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shortId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    defaultValue: () => shortId.generate(),
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id',
    },
    allowNull: true,
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: false,
  tableName: 'URLs',
});

module.exports = URL;
