const EnglishSession = require('../models/EnglishSession');
const openaiService = require('../services/openai.service');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { safeParse } = openaiService;

const AI_OPENERS = {
  interview: "Hello! I'm your AI interview coach. Let's practice for your upcoming interview. Tell me about yourself and why you're interested in your target role.",
  public_speaking: "Welcome to public speaking practice! Today we'll work on your presentation skills. Start with a 2-minute introduction about any topic you're comfortable with.",
  daily_conversation: "Hi there! Let's have a casual conversation to improve your everyday English. How has your day been going so far?",
  group_discussion: "Welcome to group discussion practice. Today's topic is: The impact of Artificial Intelligence on future careers. Please share your initial thoughts.",
  presentation: "Hello! I'm here to help you practice your presentation skills. Please begin your presentation and I'll provide feedback as we go."
};

exports.startSession = async (req, res) => {
  try {
    const { mode } = req.body;
    const roomName = `english-${req.user._id}-${uuidv4().slice(0, 8)}`;
    const aiOpener = AI_OPENERS[mode] || AI_OPENERS.daily_conversation;
    
    const session = await EnglishSession.create({
      user: req.user._id,
      mode,
      roomName,
      exchanges: [{ role: 'ai', message: aiOpener }]
    });
    
    res.json({ success: true, session, aiOpener });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const session = await EnglishSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    session.exchanges.push({ role: 'user', message });
    
    // Analyze user's English
    const analysisData = await openaiService.analyzeEnglish(message, session.mode);
    const parsed = safeParse(analysisData);
    
    // Update exchange with feedback
    const lastIdx = session.exchanges.length - 1;
    session.exchanges[lastIdx].feedback = {
      grammarErrors: parsed.grammarErrors?.map(e => e.error) || [],
      suggestions: parsed.suggestions || [],
      score: Math.round((parsed.scores.grammar + parsed.scores.fluency + parsed.scores.vocabulary) / 3)
    };
    
    // Generate AI response
    const conversationHistory = session.exchanges.map(e => ({
      role: e.role === 'ai' ? 'assistant' : 'user',
      content: e.message
    }));
    
    const aiSystemMsg = `You are an English conversation partner for ${session.mode} practice. Be encouraging, provide brief natural responses, and gently correct grammar mistakes. Keep responses concise.`;
    const aiResponse = await openaiService.chat([
      { role: 'system', content: aiSystemMsg },
      ...conversationHistory
    ], { maxTokens: 200 });
    
    session.exchanges.push({ role: 'ai', message: aiResponse });
    
    // Update running scores
    const userExchanges = session.exchanges.filter(e => e.role === 'user' && e.feedback?.score);
    if (userExchanges.length > 0) {
      const avgScore = Math.round(userExchanges.reduce((a, e) => a + e.feedback.score, 0) / userExchanges.length);
      session.scores.grammar = parsed.scores.grammar;
      session.scores.fluency = parsed.scores.fluency;
      session.scores.vocabulary = parsed.scores.vocabulary;
      session.scores.confidence = parsed.scores.confidence;
      session.scores.overall = Math.round((parsed.scores.grammar + parsed.scores.fluency + parsed.scores.vocabulary + parsed.scores.confidence) / 4);
    }
    
    await session.save();
    res.json({ success: true, aiResponse, feedback: session.exchanges[lastIdx].feedback, scores: session.scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await EnglishSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    session.status = 'completed';
    session.duration = Math.round((new Date() - session.createdAt) / 60000);
    
    // Final analysis
    const allUserMessages = session.exchanges.filter(e => e.role === 'user').map(e => e.message).join(' ');
    if (allUserMessages) {
      const finalAnalysis = await openaiService.analyzeEnglish(allUserMessages, session.mode);
      const parsed = safeParse(finalAnalysis);
      session.scores = {
        grammar: parsed.scores.grammar,
        fluency: parsed.scores.fluency,
        pronunciation: parsed.scores.pronunciation || 70,
        confidence: parsed.scores.confidence,
        vocabulary: parsed.scores.vocabulary,
        overall: Math.round(Object.values(parsed.scores).reduce((a, b) => a + b, 0) / Object.values(parsed.scores).length)
      };
      session.improvements = parsed.improvements;
      session.strengths = parsed.strengths;
    }
    
    await session.save();
    
    // Update user communication score
    await User.findByIdAndUpdate(req.user._id, { communicationScore: session.scores.overall });
    
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const sessions = await EnglishSession.find({ user: req.user._id, status: 'completed' }).sort('-createdAt').select('-exchanges');
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
