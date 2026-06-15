// Phone OTP is delivered via email (free alternative to Twilio SMS)
const emailService = require('./email.service');

exports.sendOTP = async (phone, otp, email) => {
  // If email provided, send phone OTP via email (free)
  if (email) {
    await emailService.sendPhoneOTP(email, phone, otp);
  }
  // Log in dev mode so developer can see the OTP
  if (process.env.NODE_ENV === 'development') {
    console.log(`📱 Phone OTP for ${phone}: ${otp}`);
  }
};
