const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const emailTemplates = {
  otp: (name, otp) => `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#0f172a;color:#fff;padding:40px">
<div style="max-width:500px;margin:0 auto;background:linear-gradient(135deg,#1e293b,#0f172a);border:1px solid #10b981;border-radius:16px;padding:40px;text-align:center">
<h1 style="color:#10b981;margin-bottom:8px">Margadarshak AI</h1>
<p style="color:#94a3b8;margin-bottom:32px">Your AI Career Mentor</p>
<h2 style="color:#fff;margin-bottom:24px">Verify Your Email</h2>
<p style="color:#94a3b8">Hi ${name}, your verification code is:</p>
<div style="background:#10b981;color:#fff;font-size:36px;font-weight:bold;padding:16px 32px;border-radius:12px;letter-spacing:8px;margin:24px 0">${otp}</div>
<p style="color:#64748b;font-size:12px">Expires in 10 minutes. Do not share this code.</p>
</div></body></html>`,

  welcome: (name) => `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#0f172a;color:#fff;padding:40px">
<div style="max-width:500px;margin:0 auto;background:linear-gradient(135deg,#1e293b,#0f172a);border:1px solid #10b981;border-radius:16px;padding:40px;text-align:center">
<h1 style="color:#10b981">Welcome to Margadarshak AI!</h1>
<p style="color:#94a3b8">Hi ${name}, your career journey starts now.</p>
<a href="${process.env.FRONTEND_URL}/pages/dashboard.html" style="display:inline-block;background:linear-gradient(135deg,#10b981,#3b82f6);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;margin:24px 0;font-weight:bold">Go to Dashboard</a>
</div></body></html>`,

  resetPassword: (name, otp) => `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#0f172a;color:#fff;padding:40px">
<div style="max-width:500px;margin:0 auto;background:linear-gradient(135deg,#1e293b,#0f172a);border:1px solid #ef4444;border-radius:16px;padding:40px;text-align:center">
<h1 style="color:#10b981">Margadarshak AI</h1>
<h2 style="color:#fff">Password Reset</h2>
<p style="color:#94a3b8">Hi ${name}, use this OTP to reset your password:</p>
<div style="background:#ef4444;color:#fff;font-size:36px;font-weight:bold;padding:16px 32px;border-radius:12px;letter-spacing:8px;margin:24px 0">${otp}</div>
<p style="color:#64748b;font-size:12px">Expires in 10 minutes.</p>
</div></body></html>`
};

exports.sendPhoneOTP = async (email, phone, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Margadarshak AI - Phone Verification OTP',
    html: emailTemplates.otp(`user (${phone})`, otp)
  });
};

exports.sendOTP = async (email, name, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Margadarshak AI - Email Verification OTP',
    html: emailTemplates.otp(name, otp)
  });
};

exports.sendWelcome = async (email, name) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to Margadarshak AI - Your AI Career Mentor',
    html: emailTemplates.welcome(name)
  });
};

exports.sendResetOTP = async (email, name, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Margadarshak AI - Password Reset OTP',
    html: emailTemplates.resetPassword(name, otp)
  });
};
