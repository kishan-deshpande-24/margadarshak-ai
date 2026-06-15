const Todo = require('../models/Todo');
const openaiService = require('../services/openai.service');
const { safeParse } = openaiService;

exports.getTodos = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { user: req.user._id };
    if (category) query.category = category;
    const todos = await Todo.find(query).sort({ priority: -1, createdAt: -1 });
    res.json({ success: true, todos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const todo = await Todo.create({ ...req.body, user: req.user._id });
    res.json({ success: true, todo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const todo = await Todo.findOneAndUpdate({ _id: req.params.id, user: req.user._id },
      { ...req.body, ...(req.body.completed ? { completedAt: new Date() } : {}) },
      { new: true }
    );
    if (!todo) return res.status(404).json({ success: false, message: 'Todo not found' });
    res.json({ success: true, todo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.generateAI = async (req, res) => {
  try {
    const userContext = {
      skills: req.user.skills,
      careerGoal: req.user.careerGoal,
      experience: req.user.experience
    };
    const prompt = `Generate 5 specific actionable daily todos for a career-focused person:
Profile: ${JSON.stringify(userContext)}
Return JSON: { "todos": [{ "title": "...", "description": "...", "category": "daily|weekly|interview|resume", "priority": "high|medium|low", "dueDate": "today|tomorrow|this_week" }] }`;
    
    const result = await openaiService.chat([{ role: 'user', content: prompt }], { json: true });
    const parsed = safeParse(result);
    
    const todos = await Promise.all(parsed.todos.map(t => Todo.create({
      ...t,
      user: req.user._id,
      aiGenerated: true,
      dueDate: t.dueDate === 'today' ? new Date() : t.dueDate === 'tomorrow' ? new Date(Date.now() + 86400000) : new Date(Date.now() + 7 * 86400000)
    })));
    
    res.json({ success: true, todos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
