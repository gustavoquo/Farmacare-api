const router = require('express').Router();
const auth   = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

// Públicas
router.post('/auth/register',        auth.register);
router.post('/auth/login',           auth.login);
router.post('/auth/refresh',         auth.refresh);
router.post('/auth/forgot-password', auth.forgotPassword);
router.post('/auth/logout',          auth.logout);

// Protegidas
router.get ('/users/me',          authenticate, auth.me);
router.put ('/users/me',          authenticate, auth.updateMe);
router.put ('/users/me/password', authenticate, auth.changePassword);
router.get ('/users/search',      authenticate, auth.searchUser);

module.exports = router;
