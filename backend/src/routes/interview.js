const router = require('express').Router();
const ctrl = require('../controllers/interview.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/create', ctrl.create);
router.post('/answer', ctrl.submitAnswer);
router.post('/complete', ctrl.complete);
router.get('/history', ctrl.getHistory);
router.get('/:interviewId/question', ctrl.getQuestion);
router.put('/:interviewId/analytics', ctrl.updateAnalytics);
router.get('/:id', ctrl.getInterview);

module.exports = router;
