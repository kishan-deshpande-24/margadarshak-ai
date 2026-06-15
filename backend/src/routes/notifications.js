const router = require('express').Router();
const ctrl = require('../controllers/notifications.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getNotifications);
router.put('/read', ctrl.markRead);
router.put('/read-all', ctrl.markAllRead);

module.exports = router;
