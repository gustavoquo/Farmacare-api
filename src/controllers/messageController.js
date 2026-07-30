const { PatientMessage, Caregiver, AuthUser } = require('../models');
const { ApiError, ok, created, noContent } = require('../utils/ApiError');

const checkAccess = async (patientId, userId) => {
  const c = await Caregiver.findOne({ where: { patient_id: patientId, user_id: userId } });
  if (!c) throw ApiError.forbidden('No tienes acceso a este paciente.');
};

// GET /patients/:id/messages
exports.list = async (req, res, next) => {
  try {
    await checkAccess(req.params.id, req.user.id);
    const messages = await PatientMessage.findAll({
      where: { patient_id: req.params.id },
      include: [{ model: AuthUser, as: 'user', attributes: ['nombre'] }],
      order: [['created_at', 'ASC']],
    });
    return ok(res, messages.map((m) => ({
      id:           m.id,
      patient_id:   m.patient_id,
      user_id:      m.user_id,
      user_nombre: m.user?.nombre,
      contenido:    m.contenido,
      created_at:   m.created_at,
    })));
  } catch (err) { next(err); }
};

// POST /patients/:id/messages
exports.send = async (req, res, next) => {
  try {
    await checkAccess(req.params.id, req.user.id);
    const { contenido } = req.body;
    if (!contenido) throw ApiError.badRequest('contenido es requerido.');
    const msg = await PatientMessage.create({
      patient_id: req.params.id,
      user_id:    req.user.id,
      contenido,
    });
    return created(res, msg);
  } catch (err) { next(err); }
};

// DELETE /patients/:id/messages/:messageId
exports.remove = async (req, res, next) => {
  try {
    await checkAccess(req.params.id, req.user.id);
    const msg = await PatientMessage.findOne({
      where: { id: req.params.messageId, patient_id: req.params.id },
    });
    if (!msg) throw ApiError.notFound('Mensaje no encontrado.');
    if (msg.user_id !== req.user.id) throw ApiError.forbidden('Solo puedes eliminar tus propios mensajes.');
    await msg.destroy();
    return noContent(res);
  } catch (err) { next(err); }
};
