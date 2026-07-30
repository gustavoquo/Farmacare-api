const router  = require('express').Router();
const { authenticate } = require('../middlewares/auth');

const patientCtrl     = require('../controllers/patientController');
const medicationCtrl  = require('../controllers/medicationController');
const doseCtrl        = require('../controllers/doseController');
const caregiverCtrl   = require('../controllers/caregiverController');
const inviteCtrl      = require('../controllers/inviteController');
const reportCtrl      = require('../controllers/reportController');
const notifCtrl       = require('../controllers/notificationController');
const messageCtrl     = require('../controllers/messageController');
const apptCtrl        = require('../controllers/appointmentController');

// Todas las rutas aquí requieren autenticación
router.use(authenticate);

// ─── Pacientes ────────────────────────────────────────────
router.get   ('/patients',              patientCtrl.list);
router.post  ('/patients',              patientCtrl.create);
router.post  ('/patients/join',         patientCtrl.join);
router.get   ('/patients/code/:codigo', patientCtrl.getByCode);
router.get   ('/patients/:id',          patientCtrl.get);
router.put   ('/patients/:id',          patientCtrl.update);
router.delete('/patients/:id',          patientCtrl.remove);

// ─── Medicamentos ─────────────────────────────────────────
router.get   ('/patients/:id/medications',          medicationCtrl.list);
router.post  ('/patients/:id/medications',          medicationCtrl.create);
router.put   ('/patients/:id/medications/:medId',   medicationCtrl.update);
router.patch ('/patients/:id/medications/:medId',   medicationCtrl.toggleActive);

// ─── Tomas ────────────────────────────────────────────────
router.get ('/patients/:id/doses/today',                       doseCtrl.today);
router.post('/patients/:id/medications/:medId/doses',          doseCtrl.register);

// ─── Cuidadores ───────────────────────────────────────────
router.get   ('/patients/:id/caregivers',                      caregiverCtrl.list);
router.patch ('/patients/:id/caregivers/:caregiverId',         caregiverCtrl.updateRole);
router.delete('/patients/:id/caregivers/:caregiverId',         caregiverCtrl.remove);

// ─── Invitaciones ─────────────────────────────────────────
router.get   ('/patients/:id/invites',             inviteCtrl.list);
router.post  ('/patients/:id/invites',             inviteCtrl.send);
router.delete('/patients/:id/invites/:inviteId',   inviteCtrl.cancel);
router.post  ('/invites/accept',                   inviteCtrl.accept);
router.get   ('/users/me/invites',                 inviteCtrl.myList);
router.delete('/users/me/invites/:id',             inviteCtrl.myReject);

// ─── Reportes ─────────────────────────────────────────────
router.get('/patients/:id/reports/compliance', reportCtrl.compliance);
router.get('/patients/:id/activity',           reportCtrl.activity);

// ─── Notificaciones ───────────────────────────────────────
router.get  ('/users/me/notifications',                     notifCtrl.list);
router.patch('/users/me/notifications/:notifId/read',       notifCtrl.markRead);

// ─── Mensajes ─────────────────────────────────────────────
router.get   ('/patients/:id/messages',              messageCtrl.list);
router.post  ('/patients/:id/messages',              messageCtrl.send);
router.delete('/patients/:id/messages/:messageId',   messageCtrl.remove);

// ─── Citas médicas ────────────────────────────────────────
router.get   ('/patients/:id/appointments',                   apptCtrl.list);
router.post  ('/patients/:id/appointments',                   apptCtrl.create);
router.delete('/patients/:id/appointments/:appointmentId',    apptCtrl.remove);

module.exports = router;
