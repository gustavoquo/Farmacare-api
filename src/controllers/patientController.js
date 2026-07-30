const { Patient, Caregiver, Medication, AuthUser } = require('../models');
const { ApiError, ok, created } = require('../utils/ApiError');

// Helper para verificar que el usuario tiene acceso al paciente
const checkAccess = async (patientId, userId) => {
  const caregiver = await Caregiver.findOne({ where: { patient_id: patientId, user_id: userId } });
  if (!caregiver) throw ApiError.forbidden('No tienes acceso a este paciente.');
  return caregiver;
};

const formatPatient = async (patient, userId) => {
  const caregiver = await Caregiver.findOne({ where: { patient_id: patient.id, user_id: userId } });
  const medCount  = await Medication.count({ where: { patient_id: patient.id, activo: true } });
  return {
    id:                   patient.id,
    codigo:               patient.codigo,
    nombre:               patient.nombre,
    fecha_nacimiento:     patient.fecha_nacimiento,
    sexo:                 patient.sexo,
    peso_kg:              patient.peso_kg,
    tipo_sangre:          patient.tipo_sangre,
    telefono_emergencia:  patient.telefono_emergencia,
    enfermedades:         patient.enfermedades || [],
    alergias_medicamentos: patient.alergias_medicamentos || [],
    otras_alergias:       patient.otras_alergias,
    medico_nombre:        patient.medico_nombre,
    medico_especialidad:  patient.medico_especialidad,
    medico_telefono:      patient.medico_telefono,
    notas:                patient.notas,
    rol:                  caregiver?.rol || null,
    total_medicamentos:   medCount,
  };
};

// GET /patients
exports.list = async (req, res, next) => {
  try {
    const caregivers = await Caregiver.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Patient, as: 'patient' }],
    });
    const data = await Promise.all(
      caregivers.map((c) => formatPatient(c.patient, req.user.id))
    );
    return ok(res, data);
  } catch (err) { next(err); }
};

// POST /patients
exports.create = async (req, res, next) => {
  try {
    const { nombre, fecha_nacimiento, sexo, ...rest } = req.body;
    if (!nombre || !fecha_nacimiento || !sexo)
      throw ApiError.badRequest('nombre, fecha_nacimiento y sexo son requeridos.');

    const patient = await Patient.create({ nombre, fecha_nacimiento, sexo, ...rest });
    // El creador es admin automáticamente
    await Caregiver.create({ patient_id: patient.id, user_id: req.user.id, rol: 'admin' });
    return created(res, await formatPatient(patient, req.user.id));
  } catch (err) { next(err); }
};

// GET /patients/:id
exports.get = async (req, res, next) => {
  try {
    await checkAccess(req.params.id, req.user.id);
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) throw ApiError.notFound('Paciente no encontrado.');
    return ok(res, await formatPatient(patient, req.user.id));
  } catch (err) { next(err); }
};

// PUT /patients/:id
exports.update = async (req, res, next) => {
  try {
    const caregiver = await checkAccess(req.params.id, req.user.id);
    if (caregiver.rol !== 'admin') throw ApiError.forbidden('Solo el admin puede editar el paciente.');
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) throw ApiError.notFound('Paciente no encontrado.');
    await patient.update(req.body);
    return ok(res, await formatPatient(patient, req.user.id));
  } catch (err) { next(err); }
};

// GET /patients/code/:codigo — ver paciente y cuidadores por código
exports.getByCode = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ where: { codigo: req.params.codigo } });
    if (!patient) throw ApiError.notFound('Código inválido. No se encontró ningún paciente.');

    const caregivers = await Caregiver.findAll({
      where: { patient_id: patient.id },
      include: [{ model: AuthUser, as: 'user', attributes: ['id', 'nombre', 'email'] }],
    });

    return ok(res, {
      id:         patient.id,
      codigo:     patient.codigo,
      nombre:     patient.nombre,
      cuidadores: caregivers.map((c) => ({
        id:      c.id,
        rol:     c.rol,
        user_id: c.user_id,
        nombre:  c.user?.nombre,
        email:   c.user?.email,
      })),
    });
  } catch (err) { next(err); }
};

// POST /patients/join — unirse como cuidador usando el código
exports.join = async (req, res, next) => {
  try {
    const { codigo } = req.body;
    if (!codigo) throw ApiError.badRequest('codigo es requerido.');

    const patient = await Patient.findOne({ where: { codigo } });
    if (!patient) throw ApiError.notFound('Código inválido. No se encontró ningún paciente.');

    const existing = await Caregiver.findOne({ where: { patient_id: patient.id, user_id: req.user.id } });
    if (existing) throw ApiError.conflict('Ya eres cuidador de este paciente.');

    await Caregiver.create({ patient_id: patient.id, user_id: req.user.id, rol: 'cuidador' });
    return ok(res, await formatPatient(patient, req.user.id));
  } catch (err) { next(err); }
};

// DELETE /patients/:id
exports.remove = async (req, res, next) => {
  try {
    const caregiver = await checkAccess(req.params.id, req.user.id);
    if (caregiver.rol !== 'admin') throw ApiError.forbidden('Solo el admin puede eliminar el paciente.');
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) throw ApiError.notFound('Paciente no encontrado.');
    await patient.destroy();
    return res.status(204).send();
  } catch (err) { next(err); }
};
