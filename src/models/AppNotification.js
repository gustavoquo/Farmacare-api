const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const AppNotification = sequelize.define('app_notifications', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  user_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  cuerpo: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('recordatorio', 'toma_registrada', 'invitacion', 'sistema'),
    allowNull: false,
  },
  leida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  patient_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
  },
});

module.exports = AppNotification;
