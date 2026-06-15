const Team = require('../models/Team');
const User = require('../models/User');
const openaiService = require('../services/openai.service');
const { calculateCompatibility } = require('../utils/helpers');
const Notification = require('../models/Notification');

exports.create = async (req, res) => {
  try {
    const { name, description, projectIdea, requiredSkills, domains, maxMembers } = req.body;
    const team = await Team.create({
      name, description, projectIdea,
      requiredSkills: requiredSkills ? JSON.parse(requiredSkills) : [],
      domains: domains ? JSON.parse(domains) : [],
      maxMembers: maxMembers || 5,
      creator: req.user._id,
      members: [{ user: req.user._id, role: 'Team Lead', compatibilityScore: 100 }]
    });
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.findMatches = async (req, res) => {
  try {
    const { projectIdea, skills, limit = 20 } = req.query;
    const candidates = await User.find({
      _id: { $ne: req.user._id },
      isActive: true,
      skills: { $exists: true, $ne: [] }
    }).select('fullName avatar bio skills interests careerGoal').limit(parseInt(limit) * 3);
    
    const withScores = candidates.map(c => ({
      ...c.toObject(),
      compatibilityScore: calculateCompatibility(req.user, c),
      skillMatch: Math.round((c.skills?.filter(s => req.user.skills?.includes(s)).length / Math.max(c.skills?.length, 1)) * 100),
      domainMatch: Math.round((c.interests?.filter(i => req.user.interests?.includes(i)).length / Math.max(c.interests?.length, 1)) * 100)
    }));
    
    withScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    const topMatches = withScores.slice(0, parseInt(limit));
    
    res.json({ success: true, matches: topMatches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.invite = async (req, res) => {
  try {
    const { teamId, userId } = req.body;
    const team = await Team.findOne({ _id: teamId, creator: req.user._id });
    if (!team) return res.status(404).json({ success: false, message: 'Team not found or not authorized' });
    if (team.members.length >= team.maxMembers) return res.status(400).json({ success: false, message: 'Team is full' });
    
    const alreadyInvited = team.invitations.find(i => i.user.toString() === userId && i.status === 'pending');
    if (alreadyInvited) return res.status(400).json({ success: false, message: 'Already invited' });
    
    team.invitations.push({ user: userId, status: 'pending' });
    await team.save();
    
    await Notification.create({
      user: userId,
      type: 'team',
      title: 'Team Invitation',
      message: `${req.user.fullName} invited you to join team "${team.name}"`,
      link: `/pages/teams.html?teamId=${teamId}`,
      data: { teamId }
    });
    
    res.json({ success: true, message: 'Invitation sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.respondInvitation = async (req, res) => {
  try {
    const { teamId, accept } = req.body;
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    
    const invite = team.invitations.find(i => i.user.toString() === req.user._id.toString() && i.status === 'pending');
    if (!invite) return res.status(404).json({ success: false, message: 'Invitation not found' });
    
    invite.status = accept ? 'accepted' : 'rejected';
    
    if (accept) {
      const compatibility = calculateCompatibility(req.user, await User.findById(team.creator));
      team.members.push({ user: req.user._id, role: 'Member', compatibilityScore: compatibility });
    }
    await team.save();
    res.json({ success: true, message: accept ? 'Joined team successfully' : 'Invitation declined' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ status: 'recruiting' })
      .populate('creator', 'fullName avatar')
      .populate('members.user', 'fullName avatar skills')
      .sort('-createdAt').limit(20);
    res.json({ success: true, teams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({ 'members.user': req.user._id })
      .populate('creator', 'fullName avatar')
      .populate('members.user', 'fullName avatar skills');
    res.json({ success: true, teams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
