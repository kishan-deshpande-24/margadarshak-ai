const Resume = require('../models/Resume');
const openaiService = require('../services/openai.service');
const pdfService = require('../services/pdf.service');
const pdfParse = require('pdf-parse');
const User = require('../models/User');
const axios = require('axios');
const { safeParse } = openaiService;

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    
    const response = await axios.get(req.file.path, { responseType: 'arraybuffer' });
    const pdfData = await pdfParse(Buffer.from(response.data));
    const rawText = pdfData.text;
    
    const { targetRole } = req.body;
    const analysisData = await openaiService.analyzeResume(rawText, targetRole);
    const parsed = safeParse(analysisData);
    
    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      cloudinaryId: req.file.filename,
      rawText,
      ...parsed
    });
    
    await User.findByIdAndUpdate(req.user._id, {
      resumeScore: parsed.scores?.overall || 0,
      atsScore: parsed.scores?.ats || 0
    });
    
    try {
      const reportPdfUrl = await pdfService.generateResumePDF(resume, req.user);
      resume.reportPdfUrl = reportPdfUrl;
      await resume.save();
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr.message);
      await resume.save();
    }
    
    res.json({ success: true, resume });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort('-createdAt').select('-rawText');
    res.json({ success: true, resumes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    res.json({ success: true, resume });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reanalyze = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    
    const analysisData = await openaiService.analyzeResume(resume.rawText, req.body.targetRole);
    const parsed = safeParse(analysisData);
    Object.assign(resume, parsed);
    
    try {
      const reportPdfUrl = await pdfService.generateResumePDF(resume, req.user);
      resume.reportPdfUrl = reportPdfUrl;
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr.message);
    }
    await resume.save();
    
    res.json({ success: true, resume });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
