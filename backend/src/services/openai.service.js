const Groq = require('groq-sdk');

let _groq = null;
const getClient = () => {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
};

const safeParse = (str) => {
  if (typeof str === 'object') return str;
  // Strip markdown code fences if present
  const cleaned = str.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
};

// Core chat — same signature as before
exports.chat = async (messages, options = {}) => {
  const response = await getClient().chat.completions.create({
    model: options.model || 'llama-3.3-70b-versatile',
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens || 2000,
    response_format: options.json ? { type: 'json_object' } : undefined
  });
  return response.choices[0].message.content;
};

exports.safeParse = safeParse;

exports.generateAssessmentQuestions = async (previousQuestions, userProfile) => {
  const prompt = `Generate 5 unique career interest assessment questions for a user with these details:
Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
Interests: ${userProfile.interests?.join(', ') || 'Not specified'}
Experience: ${userProfile.experience || 'fresher'}

Previously asked questions (DO NOT repeat): ${previousQuestions.map(q => q.question).join(' | ')}

Return JSON: { "questions": [{ "question": "...", "options": ["A)...", "B)...", "C)...", "D)..."], "category": "technology|design|management|marketing|finance|research|entrepreneurship|healthcare" }] }`;
  return exports.chat([{ role: 'user', content: prompt }], { json: true });
};

exports.analyzeAssessment = async (questions, userProfile) => {
  const answers = questions.map(q => `Q: ${q.question}\nSelected: ${q.selectedOption}\nCategory: ${q.category}`).join('\n\n');
  const prompt = `Analyze these career interest assessment answers and provide career recommendations:
${answers}

User Profile: Skills: ${userProfile.skills?.join(', ')}, Experience: ${userProfile.experience}

Return JSON: {
  "scores": { "technology": 0, "design": 0, "management": 0, "marketing": 0, "finance": 0, "research": 0, "entrepreneurship": 0, "healthcare": 0 },
  "careerRecommendations": [{ "career": "...", "matchScore": 0, "description": "...", "skills": [], "roadmap": "..." }],
  "learningPaths": [{ "path": "...", "priority": 1, "reason": "..." }],
  "aiInsights": "detailed paragraph insights"
}`;
  return exports.chat([{ role: 'user', content: prompt }], { json: true });
};

exports.generateRoadmap = async (data) => {
  const prompt = `Create a detailed learning roadmap:
Career Goal: ${data.careerGoal}
Current Skills: ${data.skills?.join(', ')}
Experience: ${data.experience}
Duration: ${data.duration || 12} weeks

Return JSON: {
  "title": "...",
  "milestones": [{ "week": 1, "title": "...", "tasks": ["..."] }],
  "projects": [{ "title": "...", "description": "...", "skills": [], "difficulty": "beginner|intermediate|advanced", "duration": "2 weeks" }],
  "certifications": [{ "name": "...", "provider": "...", "link": "...", "priority": "high|medium|low" }],
  "resources": [{ "title": "...", "type": "course|book|video|article", "url": "...", "free": true }],
  "targetSkills": []
}`;
  return exports.chat([{ role: 'user', content: prompt }], { json: true });
};

exports.analyzeResume = async (text, targetRole) => {
  const prompt = `Analyze this resume professionally:
${text.slice(0, 3000)}
Target Role: ${targetRole || 'Software Engineer'}

Return JSON: {
  "scores": { "overall": 0, "ats": 0, "format": 0, "content": 0, "keywords": 0, "impact": 0 },
  "sections": { "contact": {}, "summary": "...", "skills": [] },
  "missingSkills": [],
  "improvements": [],
  "strengths": [],
  "jobMatches": [{ "role": "...", "company": "...", "matchScore": 0, "missingSkills": [] }],
  "aiAnalysis": "detailed analysis paragraph",
  "keywords": { "found": [], "missing": [] }
}`;
  return exports.chat([{ role: 'user', content: prompt }], { json: true });
};

exports.generateInterviewQuestion = async (company, round, difficulty, previousQuestions, userProfile) => {
  const prompt = `Generate 1 interview question for:
Company: ${company}
Round: ${round}
Difficulty: ${difficulty}
User Skills: ${userProfile.skills?.join(', ')}

Previously asked (DO NOT repeat): ${previousQuestions.slice(-10).join(' | ')}

Return JSON: {
  "question": "...",
  "type": "behavioral|technical|coding|system_design",
  "difficulty": "easy|medium|hard",
  "expectedKeyPoints": [],
  "followUps": ["...", "..."]
}`;
  return exports.chat([{ role: 'user', content: prompt }], { json: true });
};

exports.evaluateInterviewAnswer = async (question, answer, company, round) => {
  const prompt = `Evaluate this interview answer:
Question: ${question}
Answer: ${answer}
Company: ${company}, Round: ${round}

Return JSON: {
  "score": 0,
  "feedback": "...",
  "strengths": [],
  "improvements": [],
  "followUpQuestion": "...",
  "fillerWords": [],
  "speakingSpeed": "slow|normal|fast",
  "clarityScore": 0,
  "vocabularyScore": 0
}`;
  return exports.chat([{ role: 'user', content: prompt }], { json: true });
};

exports.generateInterviewReport = async (interview) => {
  const prompt = `Generate a comprehensive interview performance report:
Company: ${interview.company}, Round: ${interview.round}
Scores: ${JSON.stringify(interview.scores)}
Analytics: ${JSON.stringify(interview.analytics)}
Questions answered: ${interview.questions?.length}

Return JSON: {
  "strengths": [],
  "improvements": [],
  "aiRecommendations": [],
  "companyReadinessScore": 0,
  "summary": "...",
  "nextSteps": []
}`;
  return exports.chat([{ role: 'user', content: prompt }], { json: true });
};

exports.analyzeEnglish = async (transcript, mode) => {
  const prompt = `Analyze English communication for ${mode} practice:
Transcript: "${transcript}"

Return JSON: {
  "grammarErrors": [{ "error": "...", "correction": "...", "explanation": "..." }],
  "suggestions": [],
  "scores": { "grammar": 0, "fluency": 0, "vocabulary": 0, "confidence": 0 },
  "improvements": [],
  "strengths": [],
  "vocabularyAlternatives": [{ "word": "...", "alternatives": [] }]
}`;
  return exports.chat([{ role: 'user', content: prompt }], { json: true });
};

exports.findTeamMatches = async (user, candidates, projectIdea) => {
  const prompt = `Find best team matches:
Seeker: Skills: ${user.skills?.join(', ')}, Interests: ${user.interests?.join(', ')}, Goal: ${user.careerGoal}
Project Idea: ${projectIdea}

Candidates: ${candidates.map(c => `ID:${c._id} Skills:${c.skills?.join(',')} Interests:${c.interests?.join(',')}`).join('\n')}

Return JSON: {
  "matches": [{ "userId": "...", "compatibilityScore": 0, "skillMatch": 0, "domainMatch": 0, "reason": "..." }]
}`;
  return exports.chat([{ role: 'user', content: prompt }], { json: true });
};

exports.chatbot = async (messages, context, userProfile) => {
  const systemPrompt = `You are Margadarshak AI, an expert career mentor. User profile: Skills: ${userProfile.skills?.join(', ') || 'not specified'}, Career Goal: ${userProfile.careerGoal || 'not specified'}, Experience: ${userProfile.experience || 'fresher'}. Context: ${context}. Provide actionable, specific career guidance. Be concise and friendly.`;
  const filtered = messages.filter(m => m.role === 'user' || m.role === 'assistant');
  return exports.chat([{ role: 'system', content: systemPrompt }, ...filtered], { maxTokens: 500 });
};
