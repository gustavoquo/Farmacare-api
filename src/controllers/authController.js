const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { AuthUser } = require('../models');
const { ApiError, ok, created } = require('../utils/ApiError');

const signAccess  = (u) => jwt.sign(
  { id: u.id, nombre: u.nombre, email: u.email },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);
const signRefresh = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' });

const formatUser = (u) => ({
  id:       u.id,
  nombre:   u.nombre,
  email:    u.email,
  telefono: u.telefono,
});

// POST /auth/register
exports.register = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password)
      throw ApiError.badRequest('nombre, email y password son requeridos.');

    const existe = await AuthUser.findOne({ where: { email } });
    if (existe) throw ApiError.conflict('Este correo ya está registrado.');

    const password_hash = await bcrypt.hash(password, 12);
    const user = await AuthUser.create({ nombre, email, password_hash });

    return created(res, {
      accessToken:  signAccess(user),
      refreshToken: signRefresh(user.id),
      user:         formatUser(user),
    });
  } catch (err) { next(err); }
};

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      throw ApiError.badRequest('email y password son requeridos.');

    const user = await AuthUser.findOne({ where: { email } });
    if (!user) throw ApiError.unauthorized('Credenciales incorrectas.');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw ApiError.unauthorized('Credenciales incorrectas.');

    return ok(res, {
      accessToken:  signAccess(user),
      refreshToken: signRefresh(user.id),
      user:         formatUser(user),
    });
  } catch (err) { next(err); }
};

// POST /auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) throw ApiError.badRequest('refresh_token requerido.');

    const payload = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    const user    = await AuthUser.findByPk(payload.id);
    if (!user) throw ApiError.unauthorized('Usuario no encontrado.');

    return ok(res, {
      accessToken:  signAccess(user),
      refreshToken: signRefresh(user.id),
    });
  } catch (err) { next(err); }
};

// POST /auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw ApiError.badRequest('email es requerido.');
    // En producción: buscar usuario y enviar correo con link de reset
    return ok(res, { message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.' });
  } catch (err) { next(err); }
};

// POST /auth/logout
exports.logout = async (req, res, next) => {
  try {
    // En producción: invalidar el refresh_token en BD/blacklist
    return ok(res, { message: 'Sesión cerrada correctamente.' });
  } catch (err) { next(err); }
};

// GET /users/me
exports.me = async (req, res, next) => {
  try {
    return ok(res, formatUser(req.user));
  } catch (err) { next(err); }
};

// PUT /users/me
exports.updateMe = async (req, res, next) => {
  try {
    const { nombre, telefono } = req.body;
    await req.user.update({ nombre, telefono });
    return ok(res, formatUser(req.user));
  } catch (err) { next(err); }
};

// GET /users/search?email=
exports.searchUser = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) throw ApiError.badRequest('El parámetro email es requerido.');
    const user = await AuthUser.findOne({ where: { email } });
    if (!user) throw ApiError.notFound('Usuario no encontrado.');
    return ok(res, { id: user.id, nombre: user.nombre, email: user.email });
  } catch (err) { next(err); }
};

// PUT /users/me/password
exports.changePassword = async (req, res, next) => {
  try {
    const { password_actual, password_nueva } = req.body;
    if (!password_actual || !password_nueva)
      throw ApiError.badRequest('password_actual y password_nueva son requeridos.');

    const valid = await bcrypt.compare(password_actual, req.user.password_hash);
    if (!valid) throw ApiError.badRequest('La contraseña actual es incorrecta.');

    const password_hash = await bcrypt.hash(password_nueva, 12);
    await req.user.update({ password_hash });
    return ok(res, { message: 'Contraseña actualizada correctamente.' });
  } catch (err) { next(err); }
};
