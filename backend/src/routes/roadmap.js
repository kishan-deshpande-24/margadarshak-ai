const router = require('express').Router();
const ctrl = require('../controllers/roadmap.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/generate', ctrl.generate);
router.get('/active', ctrl.getActive);
router.get('/all', ctrl.getAll);
router.put('/milestone', ctrl.updateMilestone);
router.put('/project', ctrl.updateProject);

module.exports = router;
