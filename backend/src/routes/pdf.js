const router = require('express').Router();
const { protect } = require('../middleware/auth');
const pdfService = require('../services/pdf.service');
const Assessment = require('../models/Assessment');
const Roadmap = require('../models/Roadmap');
const Resume = require('../models/Resume');
const Interview = require('../models/Interview');
const EnglishSession = require('../models/EnglishSession');

router.use(protect);

router.post('/assessment/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findOne({ _id: req.params.id, user: req.user._id });
    if (!assessment) return res.status(404).json({ success: false, message: 'Not found' });
    const url = await pdfService.generateAssessmentPDF(assessment, req.user);
    assessment.pdfUrl = url;
    await assessment.save();
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/roadmap/:id', async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user._id });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Not found' });
    const url = await pdfService.generateRoadmapPDF(roadmap, req.user);
    roadmap.pdfUrl = url;
    await roadmap.save();
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/resume/:id', async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' });
    const url = await pdfService.generateResumePDF(resume, req.user);
    resume.reportPdfUrl = url;
    await resume.save();
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/interview/:id', async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Not found' });
    const url = await pdfService.generateInterviewPDF(interview, req.user);
    interview.reportPdfUrl = url;
    await interview.save();
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/english/:id', async (req, res) => {
  try {
    const session = await EnglishSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: 'Not found' });

    const html = `<!DOCTYPE html><html><head><style>
* { margin:0; padding:0; box-sizing:border-box; font-family:Arial,sans-serif; }
body { background:linear-gradient(135deg,#0f172a,#1e293b); color:#fff; padding:40px; }
.header { text-align:center; padding:40px; background:linear-gradient(135deg,#ec4899,#8b5cf6); border-radius:20px; margin-bottom:32px; }
.score-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
.score-card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:20px; text-align:center; }
.score-value { font-size:36px; font-weight:bold; color:#ec4899; }
.section { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:24px; margin-bottom:24px; }
.section h2 { color:#ec4899; font-size:20px; margin-bottom:16px; }
.item { padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05); color:#94a3b8; font-size:14px; }
.footer { text-align:center; padding:24px; color:rgba(255,255,255,0.4); font-size:12px; }
</style></head><body>
<div class="header">
  <h1>🗣️ English Mentor Report</h1>
  <p>${req.user.fullName} | Mode: ${session.mode?.replace('_', ' ').toUpperCase()}</p>
  <p style="opacity:0.7;margin-top:8px">${new Date(session.createdAt).toLocaleDateString()} | Duration: ${session.duration || 0} min</p>
</div>
<div class="score-grid">
  ${Object.entries(session.scores).map(([k, v]) => `
  <div class="score-card">
    <div class="score-value">${v || 0}</div>
    <div style="color:#94a3b8;font-size:13px;text-transform:capitalize">${k}</div>
  </div>`).join('')}
</div>
<div class="section">
  <h2>Strengths</h2>
  ${session.strengths?.map(s => `<div class="item">✅ ${s}</div>`).join('') || '<div class="item">Complete more sessions for detailed feedback</div>'}
</div>
<div class="section">
  <h2>Areas for Improvement</h2>
  ${session.improvements?.map(i => `<div class="item">⚡ ${i}</div>`).join('') || '<div class="item">Keep practicing!</div>'}
</div>
<div class="footer"><p>© 2024 Margadarshak AI | Your AI Career Mentor</p></div>
</body></html>`;

    const pdfBuffer = await pdfService.generatePDF(html);
    const { cloudinary } = require('../middleware/upload');
    const url = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'margadarshak/reports', public_id: `english-${session._id}`, resource_type: 'raw', format: 'pdf' },
        (err, result) => { if (err) reject(err); else resolve(result.secure_url); }
      );
      stream.end(pdfBuffer);
    });

    session.reportPdfUrl = url;
    await session.save();
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
