const openaiService = require('../services/openai.service');
const Resume = require('../models/Resume');
const Interview = require('../models/Interview');
const EnglishSession = require('../models/EnglishSession');

const COMPANIES = {
  google: { skills: ['algorithms', 'system design', 'coding', 'distributed systems', 'ml'], culture: 'Innovation, scale, impact' },
  microsoft: { skills: ['azure', 'c#', '.net', 'cloud', 'system design'], culture: 'Growth mindset, diversity' },
  amazon: { skills: ['aws', 'leadership principles', 'scalability', 'microservices'], culture: '14 leadership principles' },
  meta: { skills: ['react', 'distributed systems', 'mobile', 'scale', 'ml'], culture: 'Move fast, social impact' },
  apple: { skills: ['ios', 'swift', 'hardware', 'ux', 'privacy'], culture: 'Perfectionism, design thinking' },
  netflix: { skills: ['streaming', 'distributed systems', 'java', 'aws', 'microservices'], culture: 'Freedom & responsibility' },
  startups: { skills: ['full-stack', 'agility', 'problem solving', 'ownership'], culture: 'Fast execution, ownership' }
};

exports.getCompanyAnalysis = async (req, res) => {
  try {
    const { company } = req.params;
    const companyData = COMPANIES[company.toLowerCase()] || COMPANIES.startups;
    
    const [latestResume, recentInterviews, englishSessions] = await Promise.all([
      Resume.findOne({ user: req.user._id }).sort('-createdAt'),
      Interview.find({ user: req.user._id, company: { $regex: company, $options: 'i' }, status: 'completed' }).sort('-completedAt').limit(5),
      EnglishSession.find({ user: req.user._id, status: 'completed' }).sort('-createdAt').limit(3)
    ]);
    
    const userSkills = req.user.skills || [];
    const requiredSkills = companyData.skills;
    const matchedSkills = requiredSkills.filter(s => userSkills.some(us => us.toLowerCase().includes(s.toLowerCase())));
    const skillReadiness = Math.round((matchedSkills.length / requiredSkills.length) * 100);
    
    const resumeReadiness = latestResume?.scores.ats || 0;
    const interviewReadiness = recentInterviews.length > 0
      ? Math.round(recentInterviews.reduce((a, i) => a + i.scores.overall, 0) / recentInterviews.length)
      : 0;
    const communicationReadiness = englishSessions.length > 0
      ? Math.round(englishSessions.reduce((a, s) => a + s.scores.overall, 0) / englishSessions.length)
      : req.user.communicationScore || 0;
    
    const overallReadiness = Math.round((skillReadiness + resumeReadiness + interviewReadiness + communicationReadiness) / 4);
    
    res.json({
      success: true,
      company: {
        name: company,
        culture: companyData.culture,
        requiredSkills,
        matchedSkills,
        missingSkills: requiredSkills.filter(s => !matchedSkills.includes(s))
      },
      readiness: {
        skill: skillReadiness,
        resume: resumeReadiness,
        interview: interviewReadiness,
        communication: communicationReadiness,
        overall: overallReadiness
      },
      recentInterviews: recentInterviews.slice(0, 3)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCompanies = async (req, res) => {
  res.json({ success: true, companies: Object.keys(COMPANIES) });
};
