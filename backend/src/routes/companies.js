const router = require('express').Router();
const ctrl = require('../controllers/companies.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getCompanies);
router.get('/:company', ctrl.getCompanyAnalysis);

module.exports = router;
