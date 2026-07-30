const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Caregiver = sequelize.define('caregivers', {
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
  rol: {
    type: DataTypes.ENUM('admin', 'cuidador'),
    allowNull: false,
    defaultValue: 'cuidador',
  },
});

module.exports = Caregiver;
