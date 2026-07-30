const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Invite = sequelize.define('invites', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  patient_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { isEmail: { msg: 'Correo de invitación inválido.' } },
  },
  rol: {
    type: DataTypes.ENUM('admin', 'cuidador'),
    allowNull: false,
    defaultValue: 'cuidador',
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aceptada', 'expirada'),
    defaultValue: 'pendiente',
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Invite;
