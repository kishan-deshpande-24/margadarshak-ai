const User = require('../models/User');
const { sanitizeUser } = require('../utils/helpers');
const Notification = require('../models/Notification');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('badges');
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio, careerGoal, skills, interests, targetCompanies, experience } = req.body;
    const updates = { fullName, bio, careerGoal, experience };
    if (skills) updates.skills = JSON.parse(skills);
    if (interests) updates.interests = JSON.parse(interests);
    if (targetCompanies) updates.targetCompanies = JSON.parse(targetCompanies);
    if (req.files?.avatar?.[0]) updates.avatar = req.files.avatar[0].path;
    if (req.files?.banner?.[0]) updates.banner = req.files.banner[0].path;
    
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    user.profileCompletion = user.calculateProfileCompletion();
    await user.save();
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.completeOnboarding = async (req, res) => {
  try {
    const { step, data } = req.body;
    const user = await User.findById(req.user._id);
    
    if (step === 1) user.skills = data.skills;
    else if (step === 2) user.interests = data.interests;
    else if (step === 3) { user.careerGoal = data.careerGoal; user.experience = data.experience; }
    else if (step === 4) user.targetCompanies = data.targetCompanies;
    else if (step === 5) { user.onboardingCompleted = true; }
    
    user.onboardingStep = step;
    user.profileCompletion = user.calculateProfileCompletion();
    await user.save();
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('badges');
    const Assessment = require('../models/Assessment');
    const Roadmap = require('../models/Roadmap');
    const Resume = require('../models/Resume');
    const Interview = require('../models/Interview');
    const Todo = require('../models/Todo');
    
    const [latestAssessment, activeRoadmap, latestResume, recentInterviews, todos] = await Promise.all([
      Assessment.findOne({ user: user._id, completed: true }).sort('-createdAt'),
      Roadmap.findOne({ user: user._id, isActive: true }),
      Resume.findOne({ user: user._id }).sort('-createdAt'),
      Interview.find({ user: user._id, status: 'completed' }).sort('-completedAt').limit(5),
      Todo.find({ user: user._id, completed: false }).sort('-createdAt').limit(5)
    ]);
    
    const avgInterviewScore = recentInterviews.length > 0
      ? Math.round(recentInterviews.reduce((a, i) => a + (i.scores.overall || 0), 0) / recentInterviews.length)
      : 0;
    
    res.json({
      success: true,
      stats: {
        profileCompletion: user.profileCompletion,
        resumeScore: latestResume?.scores.overall || 0,
        atsScore: latestResume?.scores.ats || 0,
        interviewScore: avgInterviewScore,
        communicationScore: user.communicationScore || 0,
        roadmapProgress: activeRoadmap?.progress || 0,
        badgeCount: user.badges?.length || 0,
        assessmentTop: latestAssessment?.careerRecommendations?.[0]?.career || 'Not assessed'
      },
      recentInterviews,
      todos,
      roadmap: activeRoadmap,
      latestResume: latestResume ? { scores: latestResume.scores } : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q, skills, limit = 20 } = req.query;
    const query = { _id: { $ne: req.user._id }, isActive: true };
    if (q) query.$or = [{ fullName: { $regex: q, $options: 'i' } }, { bio: { $regex: q, $options: 'i' } }];
    if (skills) query.skills = { $in: skills.split(',') };
    const users = await User.find(query).select('fullName avatar bio skills interests careerGoal').limit(parseInt(limit));
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('fullName avatar banner bio skills interests careerGoal targetCompanies badges');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
