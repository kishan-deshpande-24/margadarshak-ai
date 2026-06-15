const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    if (!token)
      return res.status(401).json({ success: false, message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -emailOTP -phoneOTP -resetPasswordOTP');
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ success: false, message: 'Token expired, please login again' });
    return res.status(401).json({ success: false, message: 'Invalid token, please login again' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};

exports.generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
