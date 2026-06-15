const router = require('express').Router();
const ctrl = require('../controllers/users.controller');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.use(protect);
router.get('/me', ctrl.getMe);
router.put('/profile', uploadImage.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), ctrl.updateProfile);
router.post('/onboarding', ctrl.completeOnboarding);
router.get('/dashboard', ctrl.getDashboardStats);
router.get('/search', ctrl.searchUsers);
router.get('/:id/profile', ctrl.getUserPublicProfile);

module.exports = router;
