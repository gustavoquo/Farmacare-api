const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Medication = sequelize.define('medications', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  patient_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  dosis: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: { args: [0.01], msg: 'La dosis debe ser mayor a 0.' } },
  },
  unidad: {
    type: DataTypes.ENUM('mg', 'ml', 'g', 'UI', 'gotas'),
    allowNull: false,
  },
  via_administracion: {
    type: DataTypes.ENUM('oral', 'inyectable', 'tópico', 'inhalado'),
    allowNull: false,
  },
  horarios: {
    type: DataTypes.JSON,   // ["HH:mm", ...]
    allowNull: false,
    defaultValue: [],
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  frecuencia_horas: {
    type: DataTypes.INTEGER,   // 4|6|8|12|24
    allowNull: true,
  },
  duracion_dias: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  dias_semana: {
    type: DataTypes.JSON,   // [1,2,3,4,5,6,7]  1=Lun
    defaultValue: [],
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  indicaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  motivo_suspension: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Medication;
