const router = require('express').Router();
const ctrl = require('../controllers/english.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/start', ctrl.startSession);
router.post('/message', ctrl.sendMessage);
router.post('/:sessionId/end', ctrl.endSession);
router.get('/history', ctrl.getHistory);

module.exports = router;
