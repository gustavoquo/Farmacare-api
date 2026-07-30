const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const DoctorAppointment = sequelize.define('doctor_appointments', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  patient_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: { isDate: { msg: 'Fecha inválida (usa YYYY-MM-DD).' } },
  },
  hora: {
    type: DataTypes.STRING(5),   // HH:mm
    allowNull: true,
  },
  motivo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  medico: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
});

module.exports = DoctorAppointment;
