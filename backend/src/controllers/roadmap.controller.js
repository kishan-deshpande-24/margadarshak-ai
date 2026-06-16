const Roadmap = require('../models/Roadmap');
const openaiService = require('../services/openai.service');
const pdfService = require('../services/pdf.service');
const Todo = require('../models/Todo');
const { safeParse } = openaiService;

function tryParseArray(value) {
  try {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      // Try JSON parse
      const p = JSON.parse(value);
      if (Array.isArray(p)) return p;
      // Fallback: split on newlines or bullets
      return value.split(/\r?\n|\r|\u2022|\-|\*|\d+\./).map(s => s.trim()).filter(Boolean);
    }
  } catch (e) { }
  return [];
}

function normalizeResource(r) {
  if (!r) return null;
  if (typeof r === 'object') return {
    title: r.title || r.name || '',
    type: r.type || 'link',
    url: r.url || r.link || '',
    free: typeof r.free === 'boolean' ? r.free : false
  };
  if (typeof r === 'string') {
    // try JSON
    try {
      const j = JSON.parse(r);
      if (Array.isArray(j)) return normalizeResource(j[0]);
      if (j && typeof j === 'object') return normalizeResource(j);
    } catch (e) {}
    // extract url
    const urlMatch = r.match(/https?:\/\/[^\s)\]]+/);
    const url = urlMatch ? urlMatch[0] : '';
    const title = r.replace(url, '').trim().replace(/^[\-\u2022\*\d\.\)\s]+/, '').trim();
    return { title: title || url || 'Resource', type: url ? 'link' : 'note', url, free: /free/i.test(r) };
  }
  return null;
}

exports.generate = async (req, res) => {
  try {
    const { careerGoal, skills, experience, duration } = req.body;
    const roadmapData = await openaiService.generateRoadmap({ careerGoal, skills, experience, duration });
    const parsed = safeParse(roadmapData);
    // Defensive parsing: ensure arrays/fields conform to schema
    const safe = {};
    safe.title = parsed.title || `${careerGoal} Roadmap`;
    safe.milestones = Array.isArray(parsed.milestones) ? parsed.milestones : (parsed.milestones ? tryParseArray(parsed.milestones) : []);
    safe.projects = Array.isArray(parsed.projects) ? parsed.projects : (parsed.projects ? tryParseArray(parsed.projects) : []);
    safe.certifications = Array.isArray(parsed.certifications) ? parsed.certifications : (parsed.certifications ? tryParseArray(parsed.certifications) : []);
    // For now, avoid complex resource parsing from AI responses that may be unstructured
    safe.resources = [];

    const roadmap = await Roadmap.create({
      user: req.user._id,
      title: safe.title,
      careerGoal,
      currentSkills: skills || req.user.skills,
      experience: experience || req.user.experience,
      duration: duration || 12,
      milestones: safe.milestones,
      projects: safe.projects,
      certifications: safe.certifications,
      resources: safe.resources,
      aiGenerated: true
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
