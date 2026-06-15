const router = require('express').Router();
const ctrl = require('../controllers/teams.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/create', ctrl.create);
router.get('/matches', ctrl.findMatches);
router.get('/my', ctrl.getMyTeams);
router.get('/', ctrl.getTeams);
router.post('/invite', ctrl.invite);
router.post('/respond', ctrl.respondInvitation);

module.exports = router;
