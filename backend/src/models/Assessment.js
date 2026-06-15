const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true },
  questions: [{
    question: String,
    options: [String],
    selectedOption: String,
    category: String,
    aiGenerated: { type: Boolean, default: true }
  }],
  scores: {
    technology: { type: Number, default: 0 },
    design: { type: Number, default: 0 },
    management: { type: Number, default: 0 },
    marketing: { type: Number, default: 0 },
    finance: { type: Number, default: 0 },
    research: { type: Number, default: 0 },
    entrepreneurship: { type: Number, default: 0 },
    healthcare: { type: Number, default: 0 }
  },
  careerRecommendations: [{
    career: String,
    matchScore: Number,
    description: String,
    skills: [String],
    roadmap: String
  }],
  learningPaths: [{ path: String, priority: Number, reason: String }],
  aiInsights: { type: String },
  completed: { type: Boolean, default: false },
  pdfUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
