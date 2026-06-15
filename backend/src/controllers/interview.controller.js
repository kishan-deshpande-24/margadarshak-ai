const Interview = require('../models/Interview');
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
    
    const previousQuestions = interview.questions.map(q => q.question);
    const difficulty = previousQuestions.length < 3 ? 'easy' : previousQuestions.length < 6 ? 'medium' : 'hard';
    
    const qData = await openaiService.generateInterviewQuestion(
      interview.company, interview.round, difficulty, previousQuestions, req.user
    );
    const parsed = safeParse(qData);
    
    if (interview.status === 'scheduled') {
      interview.status = 'active';
      interview.startedAt = new Date();
    }
    
    interview.questions.push({ ...parsed, timeSpent: 0 });
    await interview.save();
    
    res.json({ success: true, question: parsed, questionIndex: interview.questions.length - 1 });
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
