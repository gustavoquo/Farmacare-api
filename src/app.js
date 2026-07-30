require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');

const sequelize                    = require('./config/database');
require('./models');                               // registra modelos y asociaciones
const authRoutes                   = require('./routes/authRoutes');
const apiRoutes                    = require('./routes/index');
const { errorHandler, notFound }   = require('./middlewares/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares globales ──────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Health check ─────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', app: 'Farmacare API', version: '1.0.0' }));

// ─── Rutas ────────────────────────────────────────────────
app.use('/api/v1', authRoutes);
app.use('/api/v1', apiRoutes);

// ─── 404 catch-all ────────────────────────────────────────
app.use(notFound);

// ─── Manejador global de errores ──────────────────────────
app.use(errorHandler);

// ─── Conexión BD → levantar servidor ──────────────────────
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL correctamente.');

    // alter:true actualiza tablas sin borrar datos
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados.');

    app.listen(PORT, () => {
      console.log(`🚀 Farmacare API corriendo en http://localhost:${PORT}/api/v1`);
    });
  } catch (err) {
    console.error('❌ No se pudo conectar a la BD:', err.message);
    process.exit(1);
  }
})();
