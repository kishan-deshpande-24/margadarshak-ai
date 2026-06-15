const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const passport = require('passport');
const { uploadImage } = require('../middleware/upload');

router.post('/signup', uploadImage.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), ctrl.signup);
router.post('/verify-email', ctrl.verifyEmailOTP);
router.post('/verify-phone', ctrl.verifyPhoneOTP);
router.post('/login', ctrl.login);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
router.post('/resend-otp', ctrl.resendOTP);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), ctrl.googleCallback);

module.exports = router;
