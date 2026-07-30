const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const AuthUser = sequelize.define('auth_users', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { notEmpty: { msg: 'El nombre es requerido.' } },
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: { msg: 'Este correo ya está registrado.' },
    validate: { isEmail: { msg: 'Formato de correo inválido.' } },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
});

module.exports = AuthUser;
