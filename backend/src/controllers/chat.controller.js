const Chat = require('../models/Chat');
const openaiService = require('../services/openai.service');

exports.sendMessage = async (req, res) => {
  try {
    const { message, context = 'general', sessionId } = req.body;
    if (!message || !message.trim())
      return res.status(400).json({ success: false, message: 'Message is required' });

    let chat = null;
    if (sessionId) {
      chat = await Chat.findOne({ _id: sessionId, user: req.user._id });
    }
    if (!chat) {
      chat = await Chat.findOne({
        user: req.user._id,
        context,
        updatedAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
      });
    }
    if (!chat) {
      chat = await Chat.create({ user: req.user._id, context, messages: [] });
    }

    chat.messages.push({ role: 'user', content: message.trim() });

    const userProfile = { skills: req.user.skills, careerGoal: req.user.careerGoal, experience: req.user.experience };
    const history = chat.messages.slice(-10).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

    const aiResponse = await openaiService.chatbot(history, context, userProfile);
    chat.messages.push({ role: 'assistant', content: aiResponse });
    chat.lastActivity = new Date();
    await chat.save();

    res.json({ success: true, response: aiResponse, chatId: chat._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort('-updatedAt').limit(5);
    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
