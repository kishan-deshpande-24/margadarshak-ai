const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['daily', 'weekly', 'roadmap', 'interview', 'resume', 'ai_recommendation'], default: 'daily' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  completed: { type: Boolean, default: false },
  completedAt: Date,
  dueDate: Date,
  linkedTo: {
    type: { type: String, enum: ['roadmap', 'interview', 'resume', 'assessment'] },
    id: mongoose.Schema.Types.ObjectId
  },
  aiGenerated: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Todo', todoSchema);
