const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const generateCodigo = () => crypto.randomBytes(3).toString('hex').toUpperCase();

const Patient = sequelize.define('patients', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  codigo: {
    type: DataTypes.STRING(6),
    allowNull: false,
    unique: true,
    defaultValue: generateCodigo,
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { notEmpty: { msg: 'El nombre del paciente es requerido.' } },
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  sexo: {
    type: DataTypes.ENUM('masculino', 'femenino', 'otro'),
    allowNull: false,
  },
  peso_kg: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  tipo_sangre: {
    type: DataTypes.STRING(5),
    allowNull: true,
  },
  telefono_emergencia: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  enfermedades: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  alergias_medicamentos: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  otras_alergias: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  medico_nombre: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  medico_especialidad: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  medico_telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Patient;
