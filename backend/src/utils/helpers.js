const crypto = require('crypto');

exports.generateOTP = (length = 6) => {
  return crypto.randomInt(100000, 999999).toString();
};

exports.calculateCompatibility = (user1, user2) => {
  const skills1 = new Set(user1.skills || []);
  const skills2 = new Set(user2.skills || []);
  const intersection = [...skills1].filter(s => skills2.has(s));
  const union = new Set([...skills1, ...skills2]);
  const skillSimilarity = union.size > 0 ? (intersection.length / union.size) * 100 : 0;
  const skillComplement = union.size > 0 ? ((union.size - intersection.length) / union.size) * 50 : 0;
  
  const interests1 = new Set(user1.interests || []);
  const interests2 = new Set(user2.interests || []);
  const interestIntersect = [...interests1].filter(i => interests2.has(i));
  const interestScore = interests1.size > 0 ? (interestIntersect.length / Math.max(interests1.size, interests2.size)) * 100 : 0;
  
  const goalMatch = user1.careerGoal && user2.careerGoal && user1.careerGoal === user2.careerGoal ? 20 : 0;
  
  return Math.min(Math.round((skillSimilarity * 0.3 + skillComplement * 0.3 + interestScore * 0.3 + goalMatch * 0.1)), 100);
};

exports.sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.emailOTP;
  delete obj.phoneOTP;
  delete obj.resetPasswordOTP;
  delete obj.emailOTPExpiry;
  delete obj.phoneOTPExpiry;
  delete obj.resetPasswordOTPExpiry;
  return obj;
};
