const { DoseRecord, Medication, Caregiver } = require('../models');
const { ApiError, ok, created } = require('../utils/ApiError');

const checkAccess = async (patientId, userId) => {
  const c = await Caregiver.findOne({ where: { patient_id: patientId, user_id: userId } });
  if (!c) throw ApiError.forbidden('No tienes acceso a este paciente.');
  return c;
};

// GET /patients/:id/doses/today
exports.today = async (req, res, next) => {
  try {
    await checkAccess(req.params.id, req.user.id);
    const today = new Date().toISOString().split('T')[0];

    const meds = await Medication.findAll({
      where: { patient_id: req.params.id, activo: true },
    });

    // Construir schedule para hoy
    const schedule = [];
    for (const med of meds) {
      const horarios = med.horarios || [];
      for (const hora of horarios) {
        const registro = await DoseRecord.findOne({
          where: {
            medication_id:  med.id,
            patient_id:     req.params.id,
            fecha:          today,
            hora_programada: hora,
          },
        });
        schedule.push({
          medication_id:     med.id,
          medication_nombre: med.nombre,
          dosis:             med.dosis,
          unidad:            med.unidad,
          indicaciones:      med.indicaciones,
          hora_programada:   hora,
          fecha:             today,
          estado:            registro?.estado || 'pendiente',
          dose:              registro ? { hora_real: registro.hora_real } : null,
        });
      }
    }

    schedule.sort((a, b) => a.hora_programada.localeCompare(b.hora_programada));
    const tomadas   = schedule.filter((s) => s.estado === 'tomado').length;
    const pendientes = schedule.filter((s) => s.estado === 'pendiente').length;

    return ok(res, {
      fecha:     today,
      total:     schedule.length,
      tomadas,
      pendientes,
      schedule,
    });
  } catch (err) { next(err); }
};

// POST /patients/:id/medications/:medId/doses
exports.register = async (req, res, next) => {
  try {
    await checkAccess(req.params.id, req.user.id);
    const { estado, hora_programada, hora_real, notas } = req.body;
    if (!estado || !hora_programada)
      throw ApiError.badRequest('estado y hora_programada son requeridos.');
    if (!['tomado', 'omitido'].includes(estado))
      throw ApiError.badRequest('estado debe ser tomado u omitido.');

    const med = await Medication.findOne({
      where: { id: req.params.medId, patient_id: req.params.id },
    });
    if (!med) throw ApiError.notFound('Medicamento no encontrado.');

    const fecha = new Date().toISOString().split('T')[0];
    const [dose] = await DoseRecord.upsert({
      medication_id:           med.id,
      patient_id:              req.params.id,
      registered_by_user_id:   req.user.id,
      estado,
      hora_programada,
      hora_real: hora_real || null,
      fecha,
      notas: notas || null,
    });

    return created(res, dose);
  } catch (err) { next(err); }
};
