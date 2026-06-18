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

// Google OAuth — guarded so a missing config returns a clean error instead of
// throwing "Unknown authentication strategy".
const requireGoogle = (req, res, next) => {
  if (!passport.googleConfigured) {
    const frontend = process.env.FRONTEND_URL || '';
    if (req.path.includes('callback') || req.accepts('html')) {
      return res.redirect(`${frontend}/pages/login.html?error=google_unavailable`);
    }
    return res.status(503).json({ success: false, message: 'Google sign-in is not configured on this server.' });
  }
  next();
};

router.get('/google', requireGoogle, (req, res, next) =>
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next));
router.get('/google/callback', requireGoogle, (req, res, next) =>
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || ''}/pages/login.html?error=google_failed` })(req, res, next), ctrl.googleCallback);

module.exports = router;
