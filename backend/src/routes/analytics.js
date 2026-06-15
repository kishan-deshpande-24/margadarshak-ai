const router = require('express').Router();
const { protect } = require('../middleware/auth');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const Assessment = require('../models/Assessment');
const EnglishSession = require('../models/EnglishSession');
const Post = require('../models/Post');
const Todo = require('../models/Todo');

router.use(protect);

// Full platform analytics for the logged-in user
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user._id;
    const [interviews, resumes, assessments, englishSessions, todos] = await Promise.all([
      Interview.find({ user: userId, status: 'completed' }).sort('-completedAt').limit(10),
      Resume.find({ user: userId }).sort('-createdAt').limit(5),
      Assessment.find({ user: userId, completed: true }).sort('-createdAt').limit(5),
      EnglishSession.find({ user: userId, status: 'completed' }).sort('-createdAt').limit(5),
      Todo.find({ user: userId }).sort('-createdAt').limit(20)
    ]);

    // Interview score trend (last 10)
    const interviewTrend = interviews.map(i => ({
      date: i.completedAt,
      overall: i.scores.overall,
      company: i.company,
      round: i.round
    }));

    // Resume score trend
    const resumeTrend = resumes.map(r => ({
      date: r.createdAt,
      overall: r.scores.overall,
      ats: r.scores.ats
    }));

    // Assessment domain scores (latest)
    const latestAssessment = assessments[0];

    // English scores trend
    const englishTrend = englishSessions.map(s => ({
      date: s.createdAt,
      overall: s.scores.overall,
      grammar: s.scores.grammar,
      fluency: s.scores.fluency
    }));

    // Todo stats
    const completedTodos = todos.filter(t => t.completed).length;
    const todoCompletionRate = todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0;

    // Average scores
    const avgInterviewScore = interviews.length > 0
      ? Math.round(interviews.reduce((a, i) => a + i.scores.overall, 0) / interviews.length) : 0;
    const avgCommunicationScore = interviews.length > 0
      ? Math.round(interviews.reduce((a, i) => a + (i.analytics?.clarityScore || 0), 0) / interviews.length) : 0;
    const avgEnglishScore = englishSessions.length > 0
      ? Math.round(englishSessions.reduce((a, s) => a + s.scores.overall, 0) / englishSessions.length) : 0;

    res.json({
      success: true,
      analytics: {
        interviewTrend,
        resumeTrend,
        englishTrend,
        assessmentScores: latestAssessment?.scores || {},
        averages: {
          interview: avgInterviewScore,
          communication: avgCommunicationScore,
          english: avgEnglishScore,
          resume: resumes[0]?.scores.overall || 0,
          ats: resumes[0]?.scores.ats || 0
        },
        counts: {
          interviews: interviews.length,
          resumes: resumes.length,
          assessments: assessments.length,
          englishSessions: englishSessions.length
        },
        todoCompletionRate,
        totalTodos: todos.length,
        completedTodos
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Interview analytics deep-dive
router.get('/interviews', async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id, status: 'completed' }).sort('-completedAt');

    const byCompany = {};
    const byRound = {};
    interviews.forEach(i => {
      if (!byCompany[i.company]) byCompany[i.company] = [];
      byCompany[i.company].push(i.scores.overall);
      if (!byRound[i.round]) byRound[i.round] = [];
      byRound[i.round].push(i.scores.overall);
    });

    const companyAvg = Object.entries(byCompany).map(([company, scores]) => ({
      company,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length
    }));

    const roundAvg = Object.entries(byRound).map(([round, scores]) => ({
      round,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length
    }));

    res.json({ success: true, companyAvg, roundAvg, total: interviews.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Community analytics
router.get('/community', async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id });
    const totalLikes = posts.reduce((a, p) => a + p.likes.length, 0);
    const totalComments = posts.reduce((a, p) => a + p.comments.length, 0);
    const totalViews = posts.reduce((a, p) => a + p.views, 0);
    res.json({
      success: true,
      community: {
        totalPosts: posts.length,
        totalLikes,
        totalComments,
        totalViews
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
