const { Medication, Caregiver } = require('../models');
const { ApiError, ok, created } = require('../utils/ApiError');

const checkAccess = async (patientId, userId) => {
  const c = await Caregiver.findOne({ where: { patient_id: patientId, user_id: userId } });
  if (!c) throw ApiError.forbidden('No tienes acceso a este paciente.');
  return c;
};

const findMed = async (id, patientId) => {
  const med = await Medication.findOne({ where: { id, patient_id: patientId } });
  if (!med) throw ApiError.notFound('Medicamento no encontrado.');
  return med;
};

// GET /patients/:id/medications  ?activos=true
exports.list = async (req, res, next) => {
  try {
    await checkAccess(req.params.id, req.user.id);
    const where = { patient_id: req.params.id };
    if (req.query.activos === 'true')  where.activo = true;
    if (req.query.activos === 'false') where.activo = false;
    const meds = await Medication.findAll({ where, order: [['created_at', 'DESC']] });
    return ok(res, meds);
  } catch (err) { next(err); }
};

// POST /patients/:id/medications
exports.create = async (req, res, next) => {
  try {
    await checkAccess(req.params.id, req.user.id);
    const { nombre, dosis, unidad, via_administracion, horarios, cantidad, fecha_inicio } = req.body;
    if (!nombre || !dosis || !unidad || !via_administracion || !horarios || !cantidad || !fecha_inicio)
      throw ApiError.badRequest('nombre, dosis, unidad, via_administracion, horarios, cantidad y fecha_inicio son requeridos.');
    const med = await Medication.create({ ...req.body, patient_id: req.params.id });
    return created(res, med);
  } catch (err) { next(err); }
};

// PUT /patients/:id/medications/:medId
exports.update = async (req, res, next) => {
  try {
    await checkAccess(req.params.id, req.user.id);
    const med = await findMed(req.params.medId, req.params.id);
    await med.update(req.body);
    return ok(res, med);
  } catch (err) { next(err); }
};

// PATCH /patients/:id/medications/:medId  (suspender/reactivar)
exports.toggleActive = async (req, res, next) => {
  try {
    await checkAccess(req.params.id, req.user.id);
    const med = await findMed(req.params.medId, req.params.id);
    const { activo, motivo } = req.body;
    if (activo === undefined) throw ApiError.badRequest('El campo activo es requerido.');
    await med.update({ activo, motivo_suspension: activo ? null : (motivo || null) });
    return ok(res, med);
  } catch (err) { next(err); }
};
