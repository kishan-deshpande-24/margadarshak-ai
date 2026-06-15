const mongoose = require('mongoose');

const englishSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mode: { type: String, enum: ['interview', 'public_speaking', 'daily_conversation', 'group_discussion', 'presentation'], required: true },
  roomName: String,
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  exchanges: [{
    role: { type: String, enum: ['ai', 'user'] },
    message: String,
    audioUrl: String,
    timestamp: { type: Date, default: Date.now },
    feedback: {
      grammarErrors: [String],
      suggestions: [String],
      score: Number
    }
  }],
  scores: {
    grammar: { type: Number, default: 0 },
    fluency: { type: Number, default: 0 },
    pronunciation: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    vocabulary: { type: Number, default: 0 },
    overall: { type: Number, default: 0 }
  },
  improvements: [String],
  strengths: [String],
  duration: Number,
  reportPdfUrl: String
}, { timestamps: true });

module.exports = mongoose.model('EnglishSession', englishSessionSchema);
