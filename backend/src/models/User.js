const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, sparse: true },
  password: { type: String, required: true },
  googleId: { type: String, sparse: true },
  avatar: { type: String, default: '' },
  banner: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  interests: [{ type: String }],
  careerGoal: { type: String, default: '' },
  targetCompanies: [{ type: String }],
  experience: { type: String, enum: ['fresher', 'junior', 'mid', 'senior'], default: 'fresher' },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  emailOTP: { type: String },
  emailOTPExpiry: { type: Date },
  phoneOTP: { type: String },
  phoneOTPExpiry: { type: Date },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpiry: { type: Date },
  onboardingCompleted: { type: Boolean, default: false },
  onboardingStep: { type: Number, default: 0 },
  profileCompletion: { type: Number, default: 0 },
  resumeScore: { type: Number, default: 0 },
  atsScore: { type: Number, default: 0 },
  interviewScore: { type: Number, default: 0 },
  communicationScore: { type: Number, default: 0 },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  lastActive: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.calculateProfileCompletion = function() {
  const fields = ['fullName', 'email', 'phone', 'avatar', 'bio', 'careerGoal'];
  const arrayFields = ['skills', 'interests', 'targetCompanies'];
  let score = 0;
  fields.forEach(f => { if (this[f]) score += 10; });
  arrayFields.forEach(f => { if (this[f]?.length > 0) score += 10; });
  if (this.isEmailVerified) score += 5;
  if (this.isPhoneVerified) score += 5;
  return Math.min(score, 100);
};

module.exports = mongoose.model('User', userSchema);
