const { DoseRecord, Medication, Caregiver } = require('../models');
const { Op } = require('sequelize');
const { ApiError, ok } = require('../utils/ApiError');

const checkAccess = async (patientId, userId) => {
  const c = await Caregiver.findOne({ where: { patient_id: patientId, user_id: userId } });
  if (!c) throw ApiError.forbidden('No tienes acceso a este paciente.');
};

// GET /patients/:id/reports/compliance  ?desde= &hasta= &med_id=
exports.compliance = async (req, res, next) => {
  try {
    await checkAccess(req.params.id, req.user.id);

    const hasta = req.query.hasta || new Date().toISOString().split('T')[0];
    const desde = req.query.desde || (() => {
      const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0];
    })();

    const where = {
      patient_id: req.params.id,
      fecha: { [Op.between]: [desde, hasta] },
      estado: { [Op.in]: ['tomado', 'omitido'] },
    };
    if (req.query.med_id) where.medication_id = req.query.med_id;

    const records = await DoseRecord.findAll({ where, include: [{ model: Medication, as: 'medication' }] });
    const total   = records.length;
    const tomadas = records.filter((r) => r.estado === 'tomado').length;
    const omitidas = total - tomadas;

    // Desglose por medicamento
    const byMed = {};
    for (const r of records) {
      const key  = r.medication_id;
      const name = r.medication?.nombre || 'Desconocido';
      if (!byMed[key]) byMed[key] = { nombre: name, total: 0, tomadas: 0, omitidas: 0 };
      byMed[key].total++;
      if (r.estado === 'tomado') byMed[key].tomadas++;
      else byMed[key].omitidas++;
    }

    const desglose = Object.values(byMed).map((m) => ({
      ...m,
      porcentaje: m.total ? +((m.tomadas / m.total) * 100).toFixed(1) : 0,
    }));

    return ok(res, {
      porcentaje: total ? +((tomadas / total) * 100).toFixed(1) : 0,
      total,
      tomadas,
      omitidas,
      desde,
      hasta,
      desglose,
    });
  } catch (err) { next(err); }
};

// GET /patients/:id/activity  ?limit=20 &page=1
exports.activity = async (req, res, next) => {
  try {
    await checkAccess(req.params.id, req.user.id);
    const limit  = parseInt(req.query.limit)  || 20;
    const offset = (parseInt(req.query.page) - 1 || 0) * limit;

    const records = await DoseRecord.findAll({
      where: { patient_id: req.params.id },
      include: [
        { model: Medication, as: 'medication', attributes: ['nombre'] },
        { association: 'registered_by', attributes: ['nombre'] },
      ],
      order: [['fecha', 'DESC'], ['hora_programada', 'DESC']],
      limit,
      offset,
    });

    const data = records.map((r) => ({
      estado:             r.estado,
      fecha:              r.fecha,
      hora_programada:    r.hora_programada,
      registrado_por:     r.registered_by?.nombre || null,
      medicamento_nombre: r.medication?.nombre    || null,
    }));
    return ok(res, data);
  } catch (err) { next(err); }
};
