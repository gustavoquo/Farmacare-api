const { DoctorAppointment, Caregiver } = require('../models');
const { ApiError, ok, created, noContent } = require('../utils/ApiError');

const checkAccess = async (patientId, userId) => {
  const c = await Caregiver.findOne({ where: { patient_id: patientId, user_id: userId } });
  if (!c) throw ApiError.forbidden('No tienes acceso a este paciente.');
};

// GET /patients/:id/appointments
exports.list = async (req, res, next) => {
  try {
    await checkAccess(req.params.id, req.user.id);
    const appts = await DoctorAppointment.findAll({
      where: { patient_id: req.params.id },
      order: [['fecha', 'ASC']],
    });
    return ok(res, appts);
  } catch (err) { next(err); }
};

// POST /patients/:id/appointments
exports.create = async (req, res, next) => {
  try {
    await checkAccess(req.params.id, req.user.id);
    const { fecha } = req.body;
    if (!fecha) throw ApiError.badRequest('fecha es requerida (YYYY-MM-DD).');
    const appt = await DoctorAppointment.create({ ...req.body, patient_id: req.params.id });
    return created(res, appt);
  } catch (err) { next(err); }
};

// DELETE /patients/:id/appointments/:appointmentId
exports.remove = async (req, res, next) => {
  try {
    await checkAccess(req.params.id, req.user.id);
    const appt = await DoctorAppointment.findOne({
      where: { id: req.params.appointmentId, patient_id: req.params.id },
    });
    if (!appt) throw ApiError.notFound('Cita no encontrada.');
    await appt.destroy();
    return noContent(res);
  } catch (err) { next(err); }
};
