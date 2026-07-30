const { Caregiver, AuthUser, Patient } = require('../models');
const { ApiError, ok, noContent } = require('../utils/ApiError');

const requireAdmin = async (patientId, userId) => {
  const c = await Caregiver.findOne({ where: { patient_id: patientId, user_id: userId } });
  if (!c) throw ApiError.forbidden('No tienes acceso a este paciente.');
  if (c.rol !== 'admin') throw ApiError.forbidden('Solo el admin puede gestionar cuidadores.');
  return c;
};

// GET /patients/:id/caregivers
exports.list = async (req, res, next) => {
  try {
    const c = await Caregiver.findOne({ where: { patient_id: req.params.id, user_id: req.user.id } });
    if (!c) throw ApiError.forbidden('No tienes acceso a este paciente.');

    const caregivers = await Caregiver.findAll({
      where: { patient_id: req.params.id },
      include: [{ model: AuthUser, as: 'user', attributes: ['id', 'nombre', 'email'] }],
    });
    return ok(res, caregivers.map((c) => ({
      id:       c.id,
      rol:      c.rol,
      user_id:  c.user_id,
      nombre:  c.user?.nombre,
      email:   c.user?.email,
    })));
  } catch (err) { next(err); }
};

// PATCH /patients/:id/caregivers/:caregiverId  (cambiar rol)
exports.updateRole = async (req, res, next) => {
  try {
    await requireAdmin(req.params.id, req.user.id);
    const { rol } = req.body;
    if (!['admin', 'cuidador'].includes(rol))
      throw ApiError.badRequest('rol debe ser admin o cuidador.');

    const target = await Caregiver.findOne({
      where: { id: req.params.caregiverId, patient_id: req.params.id },
    });
    if (!target) throw ApiError.notFound('Cuidador no encontrado.');
    await target.update({ rol });
    return ok(res, target);
  } catch (err) { next(err); }
};

// DELETE /patients/:id/caregivers/:caregiverId
exports.remove = async (req, res, next) => {
  try {
    await requireAdmin(req.params.id, req.user.id);
    const target = await Caregiver.findOne({
      where: { id: req.params.caregiverId, patient_id: req.params.id },
    });
    if (!target) throw ApiError.notFound('Cuidador no encontrado.');
    await target.destroy();
    return noContent(res);
  } catch (err) { next(err); }
};
