const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { Badge, UserBadge } = require('../models/Badge');
const User = require('../models/User');

const DEFAULT_BADGES = [
  { name: 'First Resume', description: 'Uploaded first resume', icon: '📄', category: 'resume', rarity: 'common', points: 10, color: '#10b981' },
  { name: 'Resume Master', description: 'Achieved 90+ resume score', icon: '🏆', category: 'resume', rarity: 'rare', points: 50, color: '#f59e0b' },
  { name: 'Interview Ace', description: 'Scored 90+ in interview', icon: '🎯', category: 'interview', rarity: 'epic', points: 100, color: '#8b5cf6' },
  { name: 'Assessment Master', description: 'Completed career assessment', icon: '🧭', category: 'assessment', rarity: 'common', points: 15, color: '#3b82f6' },
  { name: 'English Pro', description: '5 English mentor sessions', icon: '🗣️', category: 'english', rarity: 'rare', points: 40, color: '#ec4899' },
  { name: 'Community Star', description: 'Posted 10 community posts', icon: '⭐', category: 'community', rarity: 'rare', points: 30, color: '#f59e0b' },
  { name: 'Team Player', description: 'Joined a team', icon: '🤝', category: 'team', rarity: 'common', points: 20, color: '#06b6d4' },
  { name: 'Roadmap Starter', description: 'Generated first roadmap', icon: '🗺️', category: 'achievement', rarity: 'common', points: 10, color: '#10b981' },
  { name: 'Legend', description: 'Earned all badges', icon: '👑', category: 'achievement', rarity: 'legendary', points: 500, color: '#fbbf24' }
];

router.get('/seed', async (req, res) => {
  try {
    await Badge.deleteMany({});
    await Badge.insertMany(DEFAULT_BADGES);
    res.json({ success: true, message: 'Badges seeded' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const allBadges = await Badge.find();
    const userBadges = await UserBadge.find({ user: req.user._id }).populate('badge');
    const earnedIds = userBadges.map(ub => ub.badge._id.toString());
    const badges = allBadges.map(b => ({ ...b.toObject(), earned: earnedIds.includes(b._id.toString()) }));
    res.json({ success: true, badges, userBadges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
