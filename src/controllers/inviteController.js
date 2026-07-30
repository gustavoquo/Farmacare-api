const { Invite, Caregiver, AuthUser } = require('../models');
const { ApiError, ok, created, noContent } = require('../utils/ApiError');

const checkAdmin = async (patientId, userId) => {
  const c = await Caregiver.findOne({ where: { patient_id: patientId, user_id: userId } });
  if (!c) throw ApiError.forbidden('No tienes acceso a este paciente.');
  if (c.rol !== 'admin') throw ApiError.forbidden('Solo el admin puede gestionar invitaciones.');
};

// GET /patients/:id/invites
exports.list = async (req, res, next) => {
  try {
    await checkAdmin(req.params.id, req.user.id);
    const invites = await Invite.findAll({
      where: { patient_id: req.params.id, estado: 'pendiente' },
      order: [['created_at', 'DESC']],
    });
    return ok(res, invites);
  } catch (err) { next(err); }
};

// POST /patients/:id/invites
exports.send = async (req, res, next) => {
  try {
    await checkAdmin(req.params.id, req.user.id);
    const { email, rol, mensaje } = req.body;
    if (!email || !rol) throw ApiError.badRequest('email y rol son requeridos.');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // expira en 7 días

    const invite = await Invite.create({
      patient_id: req.params.id,
      email,
      rol,
      expires_at: expiresAt,
    });
    // En producción: enviar correo con link usando `mensaje`
    return created(res, invite);
  } catch (err) { next(err); }
};

// POST /auth/invites/accept  (el invitado acepta)
exports.accept = async (req, res, next) => {
  try {
    const { invite_id } = req.body;
    const invite = await Invite.findByPk(invite_id);
    if (!invite) throw ApiError.notFound('Invitación no encontrada.');
    if (invite.estado !== 'pendiente') throw ApiError.conflict('Esta invitación ya fue procesada.');
    if (invite.email !== req.user.email) throw ApiError.forbidden('Esta invitación no es para tu cuenta.');
    if (invite.expires_at && new Date() > invite.expires_at)
      throw ApiError.conflict('La invitación ha expirado.');

    await Caregiver.create({ patient_id: invite.patient_id, user_id: req.user.id, rol: invite.rol });
    await invite.update({ estado: 'aceptada' });
    return ok(res, { message: 'Invitación aceptada correctamente.' });
  } catch (err) { next(err); }
};

// GET /users/me/invites — invitaciones recibidas para el usuario autenticado
exports.myList = async (req, res, next) => {
  try {
    const invites = await Invite.findAll({
      where: { email: req.user.email, estado: 'pendiente' },
      order: [['created_at', 'DESC']],
    });
    return ok(res, invites);
  } catch (err) { next(err); }
};

// DELETE /users/me/invites/:id — rechazar una invitación
exports.myReject = async (req, res, next) => {
  try {
    const invite = await Invite.findByPk(req.params.id);
    if (!invite) throw ApiError.notFound('Invitación no encontrada.');
    if (invite.email !== req.user.email) throw ApiError.forbidden('Esta invitación no es para tu cuenta.');
    if (invite.estado !== 'pendiente') throw ApiError.conflict('Esta invitación ya fue procesada.');
    await invite.update({ estado: 'rechazada' });
    return noContent(res);
  } catch (err) { next(err); }
};

// DELETE /patients/:id/invites/:inviteId
exports.cancel = async (req, res, next) => {
  try {
    await checkAdmin(req.params.id, req.user.id);
    const invite = await Invite.findOne({
      where: { id: req.params.inviteId, patient_id: req.params.id },
    });
    if (!invite) throw ApiError.notFound('Invitación no encontrada.');
    await invite.destroy();
    return noContent(res);
  } catch (err) { next(err); }
};
