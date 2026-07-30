const { AppNotification } = require('../models');
const { ApiError, ok } = require('../utils/ApiError');

// GET /users/me/notifications  ?leidas=false
exports.list = async (req, res, next) => {
  try {
    const where = { user_id: req.user.id };
    if (req.query.leidas === 'false') where.leida = false;
    if (req.query.leidas === 'true')  where.leida = true;

    const notifs = await AppNotification.findAll({
      where,
      order: [['created_at', 'DESC']],
    });
    return ok(res, notifs);
  } catch (err) { next(err); }
};

// PATCH /users/me/notifications/:notifId/read
exports.markRead = async (req, res, next) => {
  try {
    const notif = await AppNotification.findOne({
      where: { id: req.params.notifId, user_id: req.user.id },
    });
    if (!notif) throw ApiError.notFound('Notificación no encontrada.');
    await notif.update({ leida: true });
    return ok(res, notif);
  } catch (err) { next(err); }
};
