const Roadmap = require('../models/Roadmap');
const openaiService = require('../services/openai.service');
const pdfService = require('../services/pdf.service');
const Todo = require('../models/Todo');
const { safeParse } = openaiService;

exports.generate = async (req, res) => {
  try {
    const { careerGoal, skills, experience, duration } = req.body;
    const roadmapData = await openaiService.generateRoadmap({ careerGoal, skills, experience, duration });
    const parsed = safeParse(roadmapData);
    
    const roadmap = await Roadmap.create({
      user: req.user._id,
      careerGoal,
      currentSkills: skills || req.user.skills,
      experience: experience || req.user.experience,
      duration: duration || 12,
      ...parsed
    });
    
    if (parsed.milestones?.[0]?.tasks) {
      const todoPromises = parsed.milestones[0].tasks.slice(0, 3).map(task =>
        Todo.create({
          user: req.user._id,
          title: task,
          category: 'roadmap',
          priority: 'high',
          aiGenerated: true,
          linkedTo: { type: 'roadmap', id: roadmap._id },
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
      );
      await Promise.all(todoPromises);
    }
    
    try {
      const pdfUrl = await pdfService.generateRoadmapPDF(roadmap, req.user);
      roadmap.pdfUrl = pdfUrl;
      await roadmap.save();
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr.message);
    }
    
    res.json({ success: true, roadmap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getActive = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ user: req.user._id, isActive: true }).sort('-createdAt');
    res.json({ success: true, roadmap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, roadmaps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const { roadmapId, milestoneIndex, completed } = req.body;
    const roadmap = await Roadmap.findOne({ _id: roadmapId, user: req.user._id });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
    
    roadmap.milestones[milestoneIndex].completed = completed;
    if (completed) roadmap.milestones[milestoneIndex].completedAt = new Date();
    
    const completedCount = roadmap.milestones.filter(m => m.completed).length;
    roadmap.progress = Math.round((completedCount / roadmap.milestones.length) * 100);
    await roadmap.save();
    
    res.json({ success: true, roadmap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { roadmapId, projectIndex, completed } = req.body;
    const roadmap = await Roadmap.findOne({ _id: roadmapId, user: req.user._id });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
    roadmap.projects[projectIndex].completed = completed;
    await roadmap.save();
    res.json({ success: true, roadmap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
