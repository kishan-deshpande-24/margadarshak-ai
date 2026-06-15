const Assessment = require('../models/Assessment');
const openaiService = require('../services/openai.service');
const pdfService = require('../services/pdf.service');
const { UserBadge, Badge } = require('../models/Badge');
const { v4: uuidv4 } = require('uuid');
const { safeParse } = openaiService;

exports.startSession = async (req, res) => {
  try {
    const sessionId = uuidv4();
    const questionsData = await openaiService.generateAssessmentQuestions([], req.user);
    const parsed = safeParse(questionsData);
    
    const assessment = await Assessment.create({
      user: req.user._id,
      sessionId,
      questions: parsed.questions.map(q => ({ ...q, selectedOption: null }))
    });
    
    res.json({ success: true, sessionId, assessmentId: assessment._id, questions: parsed.questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMoreQuestions = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    
    const questionsData = await openaiService.generateAssessmentQuestions(assessment.questions, req.user);
    const parsed = safeParse(questionsData);
    
    assessment.questions.push(...parsed.questions.map(q => ({ ...q, selectedOption: null })));
    await assessment.save();
    res.json({ success: true, questions: parsed.questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { assessmentId, questionIndex, selectedOption } = req.body;
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    
    assessment.questions[questionIndex].selectedOption = selectedOption;
    await assessment.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.completeAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    
    const answeredQuestions = assessment.questions.filter(q => q.selectedOption);
    const analysisData = await openaiService.analyzeAssessment(answeredQuestions, req.user);
    const parsed = safeParse(analysisData);
    
    assessment.scores = parsed.scores;
    assessment.careerRecommendations = parsed.careerRecommendations;
    assessment.learningPaths = parsed.learningPaths;
    assessment.aiInsights = parsed.aiInsights;
    assessment.completed = true;
    
    try {
      const pdfUrl = await pdfService.generateAssessmentPDF(assessment, req.user);
      assessment.pdfUrl = pdfUrl;
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr.message);
    }
    await assessment.save();
    
    const badge = await Badge.findOne({ name: 'Assessment Master' });
    if (badge) await UserBadge.findOneAndUpdate({ user: req.user._id, badge: badge._id }, {}, { upsert: true });
    
    res.json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const assessments = await Assessment.find({ user: req.user._id, completed: true }).sort('-createdAt').limit(10);
    res.json({ success: true, assessments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment || assessment.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied' });
    res.json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
