const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  projectIdea: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    joinedAt: { type: Date, default: Date.now },
    compatibilityScore: Number
  }],
  requiredSkills: [String],
  domains: [String],
  maxMembers: { type: Number, default: 5 },
  status: { type: String, enum: ['recruiting', 'active', 'completed'], default: 'recruiting' },
  invitations: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    sentAt: { type: Date, default: Date.now }
  }],
  chatRoom: String,
  analytics: {
    avgCompatibility: Number,
    skillCoverage: Number,
    domainDiversity: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
