const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const emailService = require('../services/email.service');
const twilioService = require('../services/twilio.service');
const { generateOTP, sanitizeUser } = require('../utils/helpers');
const jwt = require('jsonwebtoken');
const passport = require('passport');

exports.signup = async (req, res) => {
  try {
    let { fullName, email, phone, password, skills, bio } = req.body;
    email = (email || '').trim().toLowerCase();
    if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'Email already registered' });
    
    const otp = generateOTP();
    const user = await User.create({
      fullName, email, phone, password, skills: skills ? JSON.parse(skills) : [], bio,
      avatar: req.files?.avatar?.[0]?.path || '',
      banner: req.files?.banner?.[0]?.path || '',
      emailOTP: otp,
      emailOTPExpiry: new Date(Date.now() + 10 * 60 * 1000)
    });
    
    let emailSent = true;
    try {
      await emailService.sendOTP(email, fullName, otp);
    } catch (mailErr) {
      emailSent = false;
      console.error('Signup OTP email failed:', mailErr.message);
    }
    if (phone) {
      const phoneOTP = generateOTP();
      user.phoneOTP = phoneOTP;
      user.phoneOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      try { await twilioService.sendOTP(phone, phoneOTP, email); } catch(e) { console.log('Phone OTP failed:', e.message); }
    }
    
    res.status(201).json({
      success: true,
      message: emailSent
        ? 'Account created. Please verify your email.'
        : 'Account created, but we could not send the verification email right now. Use "Resend OTP" or contact support.',
      emailSent,
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyEmailOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.emailOTP !== otp || user.emailOTPExpiry < new Date())
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    
    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpiry = undefined;
    user.profileCompletion = user.calculateProfileCompletion();
    await user.save();
    
    try { await emailService.sendWelcome(user.email, user.fullName); } catch (mailErr) { console.error('Welcome email failed:', mailErr.message); }
    const token = generateToken(user._id);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyPhoneOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.phoneOTP !== otp || user.phoneOTPExpiry < new Date())
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    
    user.isPhoneVerified = true;
    user.phoneOTP = undefined;
    user.phoneOTPExpiry = undefined;
    await user.save();
    res.json({ success: true, message: 'Phone verified successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const id = (identifier || '').trim();
    const user = await User.findOne({
      $or: [{ email: id.toLowerCase() }, { phone: id }]
    });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isEmailVerified)
      return res.status(403).json({ success: false, message: 'Please verify your email first', userId: user._id });
    
    const token = generateToken(user._id);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Email not found' });
    
    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await emailService.sendResetOTP(email, user.fullName, otp);
    res.json({ success: true, message: 'Reset OTP sent to email', userId: user._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.resetPasswordOTP !== otp || user.resetPasswordOTPExpiry < new Date())
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.googleCallback = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/pages/auth-callback.html?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/pages/login.html?error=google_failed`);
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { userId, type } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const otp = generateOTP();
    if (type === 'phone') {
      user.phoneOTP = otp;
      user.phoneOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      try { await twilioService.sendOTP(user.phone, otp, user.email); }
      catch (e) { console.error('Resend phone OTP failed:', e.message); return res.status(502).json({ success: false, message: 'Could not send OTP. Please try again later.' }); }
    } else {
      user.emailOTP = otp;
      user.emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      try { await emailService.sendOTP(user.email, user.fullName, otp); }
      catch (e) { console.error('Resend email OTP failed:', e.message); return res.status(502).json({ success: false, message: 'Could not send the email right now. Please try again later.' }); }
    }
    res.json({ success: true, message: 'OTP resent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
