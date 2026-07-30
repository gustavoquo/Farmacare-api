const { ApiError } = require('../utils/ApiError');

// Mensajes amigables por código de estado
const FRIENDLY = {
  400: 'Los datos enviados no son válidos.',
  401: 'Necesitas iniciar sesión para continuar.',
  403: 'No tienes permiso para hacer esto.',
  404: 'No encontrado — el recurso que buscas no existe.',
  409: 'Ya existe un registro con esos datos.',
  422: 'Los datos no pudieron procesarse.',
  429: 'Demasiadas solicitudes. Intenta más tarde.',
  500: 'Algo salió mal en el servidor. Intenta más tarde.',
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Errores de Sequelize → convertir a ApiError legible
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      error: {
        status: 400,
        message: 'Los datos enviados no son válidos.',
        details: messages,
      },
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: {
        status: 400,
        message: 'Referencia inválida: el registro relacionado no existe.',
      },
    });
  }

  // JWT expirado / inválido
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        status: 401,
        message: err.name === 'TokenExpiredError'
          ? 'Tu sesión ha expirado. Vuelve a iniciar sesión.'
          : 'Token inválido.',
      },
    });
  }

  // Errores operacionales propios (ApiError)
  if (err instanceof ApiError) {
    const response = {
      error: {
        status: err.statusCode,
        message: err.message,
      },
    };
    if (err.errors && err.errors.length) response.error.details = err.errors;
    return res.status(err.statusCode).json(response);
  }

  // Error inesperado — no exponer detalles en producción
  console.error('❌ Error no controlado:', err);
  const status = err.statusCode || 500;
  return res.status(status).json({
    error: {
      status,
      message: FRIENDLY[status] || FRIENDLY[500],
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

// Ruta no encontrada (404 catch-all)
const notFound = (req, res) => {
  res.status(404).json({
    error: {
      status: 404,
      message: `No encontrado — la ruta ${req.method} ${req.originalUrl} no existe.`,
    },
  });
};

module.exports = { errorHandler, notFound };
