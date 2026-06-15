const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  week: Number,
  title: String,
  tasks: [String],
  completed: { type: Boolean, default: false },
  completedAt: Date
});

const roadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  careerGoal: { type: String, required: true },
  currentSkills: [String],
  targetSkills: [String],
  experience: String,
  duration: { type: Number, default: 12 }, // weeks
  milestones: [milestoneSchema],
  projects: [{
    title: String,
    description: String,
    skills: [String],
    difficulty: String,
    duration: String,
    completed: { type: Boolean, default: false }
  }],
  certifications: [{
    name: String,
    provider: String,
    link: String,
    priority: String,
    completed: { type: Boolean, default: false }
  }],
  resources: [{
    title: String,
    type: String,
    url: String,
    free: Boolean
  }],
  progress: { type: Number, default: 0 },
  aiGenerated: { type: Boolean, default: true },
  pdfUrl: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
