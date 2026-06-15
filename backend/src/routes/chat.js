const router = require('express').Router();
const ctrl = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/message', ctrl.sendMessage);
router.get('/history', ctrl.getHistory);
router.get('/:id', ctrl.getChat);

module.exports = router;
