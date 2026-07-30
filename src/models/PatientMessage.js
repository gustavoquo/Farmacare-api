const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const PatientMessage = sequelize.define('patient_messages', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  patient_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  user_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { notEmpty: { msg: 'El mensaje no puede estar vacío.' } },
  },
});

module.exports = PatientMessage;
