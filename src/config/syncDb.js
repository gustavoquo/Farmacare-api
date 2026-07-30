require('dotenv').config();
const sequelize = require('./database');
require('../models'); // importa todos los modelos para que se registren

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a BD establecida.');
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas sincronizadas correctamente.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al sincronizar BD:', err.message);
    process.exit(1);
  }
})();
