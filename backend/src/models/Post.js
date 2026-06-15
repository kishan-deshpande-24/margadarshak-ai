const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['interview_prep', 'projects', 'career_guidance', 'hackathons', 'general'], default: 'general' },
  tags: [String],
  images: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    replies: [{
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String,
      createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  views: { type: Number, default: 0 },
  isPinned: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true }
}, { timestamps: true });

postSchema.index({ content: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);
