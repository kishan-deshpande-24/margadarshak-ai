const router = require('express').Router();
const ctrl = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');

router.use(protect);
router.post('/upload', uploadResume.single('resume'), ctrl.upload);
router.get('/history', ctrl.getHistory);
router.get('/:id', ctrl.getResume);
router.post('/:id/reanalyze', ctrl.reanalyze);

module.exports = router;
