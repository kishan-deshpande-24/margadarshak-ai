const router = require('express').Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// Development-only seed endpoint. Disabled in production.
router.post('/seed', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ success: false, message: 'Disabled in production' });

    const email = process.env.DEV_USER_EMAIL || 'dev@local.test';
    const password = process.env.DEV_USER_PASSWORD || 'Password123!';

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName: 'Dev User',
        email,
        password,
        isEmailVerified: true,
        skills: ['javascript', 'nodejs'],
        bio: 'Development seed user'
      });
    }

    const token = generateToken(user._id);
    res.json({ success: true, email, password, token, userId: user._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
