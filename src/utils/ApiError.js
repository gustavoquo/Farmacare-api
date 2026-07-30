// ─── Clase base de errores HTTP ────────────────────────────────────────────────
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }

  static badRequest(msg, errors)  { return new ApiError(400, msg || 'Solicitud inválida', errors); }
  static unauthorized(msg)        { return new ApiError(401, msg || 'No autorizado'); }
  static forbidden(msg)           { return new ApiError(403, msg || 'Acceso denegado'); }
  static notFound(msg)            { return new ApiError(404, msg || 'No encontrado'); }
  static conflict(msg)            { return new ApiError(409, msg || 'Conflicto con el estado actual'); }
  static internal(msg)            { return new ApiError(500, msg || 'Error interno del servidor'); }
}

// ─── Helpers de respuesta estandarizada ────────────────────────────────────────
const ok = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ data });

const created = (res, data) =>
  res.status(201).json({ data });

const noContent = (res) =>
  res.status(204).send();

module.exports = { ApiError, ok, created, noContent };
