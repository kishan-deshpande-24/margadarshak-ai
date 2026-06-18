const Groq = require('groq-sdk');
const { poolFor, getFallbackQuestion } = require('../data/companyQuestions');

let _groq = null;
const getClient = () => {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
};

const collapseConcatenatedString = (text) => {
  if (typeof text !== 'string') return text;
  let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').replace(/\r/g, '').trim();

  cleaned = cleaned.replace(/(['"])\s*\+\s*(['"])/g, ' ');
  cleaned = cleaned.replace(/\r?\n/g, ' ');
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  cleaned = cleaned.replace(/\s*\+\s*/g, ' ');

  return cleaned.trim();
};

const extractJsonLike = (text) => {
  if (typeof text !== 'string') return null;
  const startIndex = text.search(/[\{\[]/);
  if (startIndex < 0) return null;
  let depth = 0;
  let inString = false;
  let quoteChar = null;
  let escaped = false;
  for (let i = startIndex; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === quoteChar) {
        inString = false;
        quoteChar = null;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      inString = true;
      quoteChar = char;
      continue;
    }
    if (char === '{' || char === '[') {
      depth += 1;
      continue;
    }
    if (char === '}' || char === ']') {
      depth -= 1;
      if (depth === 0) {
        return text.slice(startIndex, i + 1);
      }
    }
  }
  return null;
};

const parseJsonLikeFields = (text) => {
  if (typeof text !== 'string') return null;

  const normalized = text
    .replace(/\r?\n/g, ' ')
    .replace(/\s*\+\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const ensureString = (value) => typeof value === 'string' ? value.trim().replace(/^['"]|['"]$/g, '') : value;
  const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');

  const parseArrayItems = (raw) => {
    if (!raw) return [];
    const value = ensureString(raw);
    const quoted = Array.from(value.matchAll(/['"]([^'"\]]+)['"]/g), (m) => m[1].trim());
    if (quoted.length > 0) return quoted.filter(Boolean);
    return value.split(/[,;|]/).map((item) => item.replace(/['"]+/g, '').trim()).filter(Boolean);
  };

  const findValue = (key) => {
    const safeKey = escapeRegex(key);
    const match = normalized.match(new RegExp(`['"]?${safeKey}['"]?\\s*[:=]\\s*`, 'i'));
    if (!match) return null;

    let cursor = match.index + match[0].length;
    let tail = normalized.slice(cursor).trim();
    if (!tail) return null;

    const openChar = tail[0];
    if (openChar === '"' || openChar === "'") {
      const quote = openChar;
      let escaped = false;
      let value = '';
      for (let i = 1; i < tail.length; i++) {
        const char = tail[i];
        if (escaped) {
          value += char;
          escaped = false;
          continue;
        }
        if (char === '\\') {
          escaped = true;
          continue;
        }
        if (char === quote) {
          return value;
        }
        value += char;
      }
      return value;
    }

    if (openChar === '[') {
      let depth = 0;
      let inString = false;
      let quote = null;
      let escaped = false;
      let value = '';
      for (let i = 0; i < tail.length; i++) {
        const char = tail[i];
        if (inString) {
          if (escaped) {
            escaped = false;
          } else if (char === '\\') {
            escaped = true;
          } else if (char === quote) {
            inString = false;
            quote = null;
          }
          if (depth > 0) value += char;
          continue;
        }
        if (char === '"' || char === "'") {
          inString = true;
          quote = char;
          if (depth > 0) value += char;
          continue;
        }
        if (char === '[') {
          depth += 1;
          if (depth > 1) value += char;
          continue;
        }
        if (char === ']') {
          depth -= 1;
          if (depth === 0) {
            return value.trim();
          }
          value += char;
          continue;
        }
        if (depth > 0) value += char;
      }
      return value.trim();
    }

    const bare = tail.match(/^[^,\]\}]+/);
    return bare ? ensureString(bare[0]) : null;
  };

  const question = findValue('question');
  if (!question) return null;

  const type = findValue('type') || 'technical';
  const difficulty = findValue('difficulty') || 'easy';
  const expectedKeyPointsRaw = findValue('expectedKeyPoints') || findValue('expected_key_points') || findValue('expectedKeyPoint');
  const followUpsRaw = findValue('followUps') || findValue('follow_ups') || findValue('followUpQuestions');

  return {
    question,
    type,
    difficulty,
    expectedKeyPoints: parseArrayItems(expectedKeyPointsRaw),
    followUps: parseArrayItems(followUpsRaw)
  };
};

const tryParseJson = (text) => {
  if (typeof text !== 'string') return null;
  const cleaned = collapseConcatenatedString(text);
  if (!cleaned) return null;
  const tryJson = (value) => {
    try {
      const parsed = JSON.parse(value);
      return (parsed && typeof parsed === 'object') ? parsed : null;
    } catch (e) {
      return null;
    }
  };

  const fullJson = tryJson(cleaned);
  if (fullJson) return fullJson;

  const originalLooksLikeObject = /^[\s\[{]/.test(cleaned);
  const extracted = extractJsonLike(cleaned);
  if (extracted && originalLooksLikeObject) {
    const extractedJson = tryJson(extracted);
    if (extractedJson) return extractedJson;
  }

  const normalized = cleaned
    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
    .replace(/'((?:\\'|[^'])*?)'/g, '"$1"')
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/\bundefined\b/g, 'null')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const wrapped = /^[\[{]/.test(normalized)
    ? normalized
    : `{ ${normalized.replace(/^[\s\{]+|[\s\}]+$/g, '')} }`;

  const normalizedJson = tryJson(wrapped);
  if (normalizedJson) return normalizedJson;

  if (/^[\[{]/.test(cleaned)) {
    const match = cleaned.match(/({[\s\S]*}|\[[\s\S]*\])/);
    if (match) {
      const matchedJson = tryJson(match[0]);
      if (matchedJson) return matchedJson;
    }
  }

  return parseJsonLikeFields(cleaned);
};

const safeParse = (str) => {
  if (typeof str === 'object') return str;
  const parsed = tryParseJson(str);
  if (parsed !== null) return parsed;
  throw new Error('Unable to parse AI response as JSON');
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

exports.getFallbackInterviewQuestion = getFallbackQuestion;

exports.generateInterviewQuestion = async (company, round, difficulty, previousQuestions, userProfile) => {
  // Ground the model with real, commonly-asked questions for this company/round.
  const examples = poolFor(company, round).slice(0, 6);
  const prompt = `You are a senior interviewer at ${company}. Ask ONE realistic interview question that has actually been asked in real ${company} ${round} interviews (or is very representative of them). Make it specific to ${company}'s known interview style — do NOT invent generic filler.

Round: ${round}
Difficulty: ${difficulty}
Candidate skills: ${userProfile.skills?.join(', ') || 'general software engineering'}

Real ${company} ${round} questions for reference (use the same style; you MAY pick one of these if it has not been asked yet, otherwise produce a similar authentic one):
${examples.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Previously asked in THIS session (DO NOT repeat): ${previousQuestions.slice(-10).join(' | ') || 'none yet'}

Return only valid JSON with no explanation or markdown fences:
{
  "question": "...",
  "type": "behavioral|technical|coding|system_design",
  "difficulty": "easy|medium|hard",
  "expectedKeyPoints": ["..."],
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
