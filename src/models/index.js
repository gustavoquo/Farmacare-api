// Carga todos los modelos y define asociaciones
const AuthUser          = require('./AuthUser');
const Patient           = require('./Patient');
const Caregiver         = require('./Caregiver');
const Medication        = require('./Medication');
const DoseRecord        = require('./DoseRecord');
const Invite            = require('./Invite');
const AppNotification   = require('./AppNotification');
const PatientMessage    = require('./PatientMessage');
const DoctorAppointment = require('./DoctorAppointment');

// ─── Asociaciones ──────────────────────────────────────────────────────────────

// AuthUser <-> Patient (N:M a través de Caregiver)
AuthUser.belongsToMany(Patient, { through: Caregiver, foreignKey: 'user_id', otherKey: 'patient_id', as: 'patients' });
Patient.belongsToMany(AuthUser, { through: Caregiver, foreignKey: 'patient_id', otherKey: 'user_id', as: 'authUsers' });

// Caregiver directo (para includes con datos del cuidador)
Caregiver.belongsTo(AuthUser, { foreignKey: 'user_id', as: 'user' });
Caregiver.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient -> Medications
Patient.hasMany(Medication, { foreignKey: 'patient_id', as: 'medications', onDelete: 'CASCADE' });
Medication.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Medication -> DoseRecords
Medication.hasMany(DoseRecord, { foreignKey: 'medication_id', as: 'dose_records', onDelete: 'CASCADE' });
DoseRecord.belongsTo(Medication, { foreignKey: 'medication_id', as: 'medication' });
DoseRecord.belongsTo(Patient,    { foreignKey: 'patient_id', as: 'patient' });
DoseRecord.belongsTo(AuthUser,   { foreignKey: 'registered_by_user_id', as: 'registered_by' });

// Patient -> Invites
Patient.hasMany(Invite, { foreignKey: 'patient_id', as: 'invites', onDelete: 'CASCADE' });
Invite.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// AuthUser -> AppNotifications
AuthUser.hasMany(AppNotification, { foreignKey: 'user_id', as: 'notifications', onDelete: 'CASCADE' });
AppNotification.belongsTo(AuthUser, { foreignKey: 'user_id', as: 'user' });

// Patient -> PatientMessages
Patient.hasMany(PatientMessage, { foreignKey: 'patient_id', as: 'messages', onDelete: 'CASCADE' });
PatientMessage.belongsTo(Patient,  { foreignKey: 'patient_id', as: 'patient' });
PatientMessage.belongsTo(AuthUser, { foreignKey: 'user_id', as: 'user' });

// Patient -> DoctorAppointments
Patient.hasMany(DoctorAppointment, { foreignKey: 'patient_id', as: 'appointments', onDelete: 'CASCADE' });
DoctorAppointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

module.exports = {
  AuthUser,
  Patient,
  Caregiver,
  Medication,
  DoseRecord,
  Invite,
  AppNotification,
  PatientMessage,
  DoctorAppointment,
};
