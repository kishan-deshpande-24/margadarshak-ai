const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['badge', 'interview', 'team', 'community', 'system', 'reminder'] },
  title: { type: String, required: true },
  message: String,
  link: String,
  read: { type: Boolean, default: false },
  readAt: Date,
  data: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
