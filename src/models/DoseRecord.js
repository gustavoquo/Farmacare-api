const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const DoseRecord = sequelize.define('dose_records', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  medication_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  patient_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  registered_by_user_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('tomado', 'omitido', 'pendiente'),
    allowNull: false,
  },
  hora_programada: {
    type: DataTypes.STRING(5),   // HH:mm
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  hora_real: {
    type: DataTypes.STRING(5),
    allowNull: true,
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = DoseRecord;
