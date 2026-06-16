const Interview = require('../models/Interview');
const mongoose = require('mongoose');
const openaiService = require('../services/openai.service');
const pdfService = require('../services/pdf.service');
const { AccessToken } = require('livekit-server-sdk');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { safeParse } = openaiService;

exports.create = async (req, res) => {
  try {
    const { company, round } = req.body;
    const roomName = `interview-${req.user._id}-${uuidv4().slice(0, 8)}`;
    
    const interview = await Interview.create({
      user: req.user._id,
      company,
      round,
      roomName,
      status: 'scheduled'
    });
    
    // Generate LiveKit token
    const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: req.user._id.toString(),
      name: req.user.fullName
    });
    token.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
    const livekitToken = await token.toJwt();
    
    interview.livekitToken = livekitToken;
    await interview.save();
    
    res.json({ success: true, interview, livekitToken, roomName, livekitUrl: process.env.LIVEKIT_URL });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    
    let previousQuestions = [];
    if (Array.isArray(interview.questions)) {
      previousQuestions = interview.questions.filter(q => q && typeof q === 'object').map(q => q.question || '').filter(Boolean);
      const hasMalformed = interview.questions.some(q => typeof q !== 'object');
      if (hasMalformed) {
        await Interview.findByIdAndUpdate(interview._id, { $set: { questions: interview.questions.filter(q => typeof q === 'object') } }, { runValidators: false });
      }
    } else if (typeof interview.questions === 'string') {
      // Recover from malformed stored data
      previousQuestions = interview.questions.match(/question:\s*['\"]([^'\"]+)['\"]/g)?.map(s => s.replace(/question:\s*['\"]|['\"]$/g, '')) || [];
      await Interview.findByIdAndUpdate(interview._id, { $set: { questions: [] } }, { runValidators: false });
      interview.questions = [];
    }
    const difficulty = previousQuestions.length < 3 ? 'easy' : previousQuestions.length < 6 ? 'medium' : 'hard';
    
    const qData = await openaiService.generateInterviewQuestion(
      interview.company, interview.round, difficulty, previousQuestions, req.user
    );
    let parsed = null;
    try {
      parsed = safeParse(qData);
    } catch (parseErr) {
      parsed = null;
    }

    if (Array.isArray(parsed)) {
      parsed = parsed[0];
    }
    if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
      parsed = parsed.questions[0];
    }

    const parseList = (raw) => {
      if (!raw) return [];
      if (Array.isArray(raw)) {
        return raw.map(item => String(item?.question || item?.text || item).trim()).filter(Boolean);
      }
      return String(raw).split(/\r?\n|;|\||,|\[|\]/).map(s => s.replace(/['\"]+/g, '').trim()).filter(Boolean);
    };

    const fallbackParse = (text) => {
      if (typeof text !== 'string') return null;
      const questionMatch = text.match(/question\s*[:=]\s*['\"]([^'\"]+)['\"]/i);
      const difficultyMatch = text.match(/difficulty\s*[:=]\s*['\"]([^'\"]+)['\"]/i);
      const typeMatch = text.match(/type\s*[:=]\s*['\"]([^'\"]+)['\"]/i);
      const expectedKeyPointsMatch = text.match(/expectedKeyPoints\s*[:=]\s*\[([^\]]*)\]/i);
      const followUpsMatch = text.match(/followUps\s*[:=]\s*\[([^\]]*)\]/i);
      return {
        question: questionMatch?.[1] || '',
        type: typeMatch?.[1] || 'technical',
        difficulty: difficultyMatch?.[1] || difficulty,
        expectedKeyPoints: parseList(expectedKeyPointsMatch?.[1]),
        followUps: parseList(followUpsMatch?.[1]).map(question => ({ question }))
      };
    };

    const normalizeQuestion = (p) => {
      if (!p) p = fallbackParse(String(qData));
      if (!p) return { question: 'Sorry, could not generate a question', type: 'technical', difficulty, expectedKeyPoints: [], followUps: [], timeSpent: 0 };
      const expectedKeyPoints = Array.isArray(p.expectedKeyPoints)
        ? p.expectedKeyPoints.map(item => String(item?.text || item).trim()).filter(Boolean)
        : parseList(p.expectedKeyPoints);
      const followUps = Array.isArray(p.followUps)
        ? p.followUps.map(item => String(item?.question || item?.text || item).trim()).filter(Boolean)
        : parseList(p.followUps);
      return {
        question: String(p.question || p.prompt || p.text || '').trim() || 'Sorry, could not generate a question',
        type: String(p.type || 'technical').trim() || 'technical',
        difficulty: String(p.difficulty || difficulty).trim() || difficulty,
        expectedKeyPoints,
        followUps: followUps.map(question => ({ question })),
        timeSpent: 0
      };
    };

    const safeQuestion = normalizeQuestion(parsed);
    const update = { $push: { questions: safeQuestion } };
    if (interview.status === 'scheduled') { update.$set = { status: 'active', startedAt: new Date() }; }
    const updated = await Interview.findByIdAndUpdate(interview._id, update, { new: true, runValidators: false });
    const questionIndex = (updated.questions || []).length - 1;
    res.json({ success: true, question: safeQuestion, questionIndex });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeSpent, analyticsData } = req.body;
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    
    const question = interview.questions[questionIndex];
    const evalData = await openaiService.evaluateInterviewAnswer(question.question, answer, interview.company, interview.round);
    const parsed = safeParse(evalData);
    
    interview.questions[questionIndex] = {
      ...question,
      answer,
      feedback: parsed.feedback,
      score: parsed.score,
      timeSpent: timeSpent || 0
    };
    
    // Update analytics
    if (analyticsData) {
      interview.analytics.tabSwitches = (interview.analytics.tabSwitches || 0) + (analyticsData.tabSwitches || 0);
      interview.analytics.multipleFacesDetected = Math.max(interview.analytics.multipleFacesDetected || 0, analyticsData.multipleFaces || 0);
    }
    
    await interview.save();
    res.json({ success: true, feedback: parsed.feedback, score: parsed.score, followUpQuestion: parsed.followUpQuestion });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.complete = async (req, res) => {
  try {
    const { interviewId, analyticsData } = req.body;
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    
    // Calculate scores
    const answeredQ = interview.questions.filter(q => q.score !== undefined);
    const avgScore = answeredQ.length > 0 ? Math.round(answeredQ.reduce((a, q) => a + q.score, 0) / answeredQ.length) : 0;
    
    interview.scores.overall = avgScore;
    interview.scores.technical = avgScore;
    interview.scores.communication = analyticsData?.clarityScore || Math.round(avgScore * 0.9);
    
    if (analyticsData) {
      interview.analytics = { ...interview.analytics, ...analyticsData };
    }
    
    // Calculate integrity score based on violations
    const violations = (interview.analytics.tabSwitches || 0) + (interview.analytics.multipleFacesDetected || 0);
    interview.analytics.integrityScore = Math.max(0, 100 - violations * 10);
    interview.analytics.attentionScore = analyticsData?.attentionScore || 75;
    interview.analytics.focusScore = analyticsData?.focusScore || 70;
    
    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.duration = Math.round((new Date() - interview.startedAt) / 60000);
    
    // Generate report
    const reportData = await openaiService.generateInterviewReport(interview);
    const reportParsed = safeParse(reportData);
    interview.strengths = reportParsed.strengths;
    interview.improvements = reportParsed.improvements;
    interview.aiRecommendations = reportParsed.aiRecommendations;
    interview.companyReadinessScore = reportParsed.companyReadinessScore;
    
    try {
      const reportPdfUrl = await pdfService.generateInterviewPDF(interview, req.user);
      interview.reportPdfUrl = reportPdfUrl;
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr.message);
    }
    await interview.save();
    
    // Update user stats
    await User.findByIdAndUpdate(req.user._id, { interviewScore: avgScore });
    
    res.json({ success: true, interview });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort('-createdAt').select('-questions');
    res.json({ success: true, interviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.json({ success: true, interview });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAnalytics = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findOne({ _id: interviewId, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    
    Object.assign(interview.analytics, req.body);
    await interview.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
