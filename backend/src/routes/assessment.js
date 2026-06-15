const router = require('express').Router();
const ctrl = require('../controllers/assessment.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/start', ctrl.startSession);
router.post('/answer', ctrl.submitAnswer);
router.get('/history', ctrl.getHistory);
router.get('/:assessmentId/questions', ctrl.getMoreQuestions);
router.post('/:assessmentId/complete', ctrl.completeAssessment);
router.get('/:id', ctrl.getAssessment);

module.exports = router;
