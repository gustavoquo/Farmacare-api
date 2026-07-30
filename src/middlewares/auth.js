const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/ApiError');
const { AuthUser } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Se requiere token de autenticación.');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await AuthUser.findByPk(payload.id);
    if (!user) throw ApiError.unauthorized('Usuario no encontrado.');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate };
