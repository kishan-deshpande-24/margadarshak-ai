const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: String,
  fileUrl: String,
  cloudinaryId: String,
  rawText: { type: String },
  sections: {
    contact: mongoose.Schema.Types.Mixed,
    summary: String,
    experience: [mongoose.Schema.Types.Mixed],
    education: [mongoose.Schema.Types.Mixed],
    skills: [String],
    projects: [mongoose.Schema.Types.Mixed],
    certifications: [mongoose.Schema.Types.Mixed]
  },
  scores: {
    overall: { type: Number, default: 0 },
    ats: { type: Number, default: 0 },
    format: { type: Number, default: 0 },
    content: { type: Number, default: 0 },
    keywords: { type: Number, default: 0 },
    impact: { type: Number, default: 0 }
  },
  missingSkills: [String],
  improvements: [String],
  strengths: [String],
  jobMatches: [{
    role: String,
    company: String,
    matchScore: Number,
    missingSkills: [String]
  }],
  aiAnalysis: { type: String },
  keywords: { found: [String], missing: [String] },
  reportPdfUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
