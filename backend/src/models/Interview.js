const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  round: { type: String, enum: ['hr', 'technical', 'behavioral', 'coding', 'system_design'], required: true },
  roomName: { type: String, unique: true },
  livekitToken: String,
  status: { type: String, enum: ['scheduled', 'active', 'completed', 'abandoned'], default: 'scheduled' },
  questions: [{
    question: String,
    type: String,
    difficulty: String,
    answer: String,
    feedback: String,
    score: Number,
    timeSpent: Number,
    followUps: [{ question: String, answer: String }]
  }],
  codeSubmissions: [{
    problem: String,
    language: String,
    code: String,
    output: String,
    passed: Boolean,
    score: Number
  }],
  scores: {
    overall: { type: Number, default: 0 },
    technical: { type: Number, default: 0 },
    behavioral: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    coding: { type: Number, default: 0 },
    systemDesign: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 }
  },
  analytics: {
    speakingSpeed: Number,
    clarityScore: Number,
    vocabularyScore: Number,
    fillerWordCount: Number,
    fillerWords: [String],
    responseCompleteness: Number,
    attentionScore: Number,
    focusScore: Number,
    integrityScore: Number,
    eyeContactScore: Number,
    facialEngagement: Number,
    sessionEngagement: Number,
    tabSwitches: { type: Number, default: 0 },
    multipleFacesDetected: { type: Number, default: 0 },
    micDisconnects: { type: Number, default: 0 },
    inactivityPeriods: { type: Number, default: 0 }
  },
  strengths: [String],
  improvements: [String],
  aiRecommendations: [String],
  companyReadinessScore: { type: Number, default: 0 },
  duration: Number,
  startedAt: Date,
  completedAt: Date,
  recordingUrl: String,
  reportPdfUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
