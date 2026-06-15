const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  icon: String,
  category: { type: String, enum: ['resume', 'interview', 'english', 'assessment', 'community', 'team', 'achievement'] },
  criteria: String,
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
  points: { type: Number, default: 10 },
  color: { type: String, default: '#10b981' }
});

const userBadgeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  earnedAt: { type: Date, default: Date.now },
  context: String
}, { timestamps: true });

const Badge = mongoose.model('Badge', badgeSchema);
const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

module.exports = { Badge, UserBadge };
