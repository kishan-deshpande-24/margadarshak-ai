const puppeteer = require('puppeteer');
const { cloudinary } = require('../middleware/upload');
const path = require('path');

const generatePDF = async (html) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
  await browser.close();
  return pdf;
};

const uploadPDFToCloudinary = async (pdfBuffer, folder, filename) => {
  // Try Cloudinary upload first; fallback to local file if not configured or upload fails
  try {
    if (!cloudinary || !cloudinary.uploader) throw new Error('Cloudinary not configured');
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `margadarshak/${folder}`, public_id: filename, resource_type: 'raw', format: 'pdf' },
        (err, result) => { if (err) reject(err); else resolve(result); }
      );
      stream.end(pdfBuffer);
    });
    const url = result && (result.secure_url || result.url);
    // verify accessibility
    if (url) {
      const https = require('https');
      const accessible = await new Promise(resolve => {
        try {
          const req = https.request(url, { method: 'HEAD' }, (res) => { resolve(res.statusCode >= 200 && res.statusCode < 400); });
          req.on('error', () => resolve(false));
          req.end();
        } catch (e) { resolve(false); }
      });
      if (accessible) return url;
      // else fall through to local save
    }
    // If result missing or not accessible, throw to trigger fallback
    throw new Error('Cloudinary upload returned inaccessible URL');
  } catch (err) {
    // Fallback: save to backend/public/reports and return local URL
    const fs = require('fs');
    const path = require('path');
    const reportsDir = path.join(__dirname, '..', '..', 'public', 'reports');
    try { fs.mkdirSync(reportsDir, { recursive: true }); } catch(e){}
    const filePath = path.join(reportsDir, `${filename}.pdf`);
    fs.writeFileSync(filePath, pdfBuffer);
    // Return a path that the server can serve (see server static route)
    const host = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    return `${host}/reports/${filename}.pdf`;
  }
};

exports.generateAssessmentPDF = async (assessment, user) => {
  const scores = assessment.scores;
  const maxScore = Math.max(...Object.values(scores));
  const html = `<!DOCTYPE html><html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Arial', sans-serif; }
body { background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; padding: 40px; min-height: 100vh; }
.header { text-align: center; padding: 40px; background: linear-gradient(135deg, #10b981, #3b82f6); border-radius: 20px; margin-bottom: 32px; }
.header h1 { font-size: 32px; margin-bottom: 8px; }
.header p { font-size: 16px; opacity: 0.9; }
.section { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
.section h2 { color: #10b981; font-size: 20px; margin-bottom: 16px; }
.score-bar { margin-bottom: 12px; }
.score-label { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; }
.bar { height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 5px; background: linear-gradient(90deg, #10b981, #3b82f6); }
.career-card { background: rgba(16,185,129,0.1); border: 1px solid #10b981; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
.career-card h3 { color: #10b981; margin-bottom: 8px; }
.tag { display: inline-block; background: rgba(59,130,246,0.2); color: #3b82f6; padding: 4px 10px; border-radius: 20px; font-size: 12px; margin: 2px; }
.footer { text-align: center; padding: 24px; color: rgba(255,255,255,0.4); font-size: 12px; }
</style></head><body>
<div class="header">
  <h1>🧭 Margadarshak AI</h1>
  <p>Career Interest Assessment Report</p>
  <p style="margin-top:8px;opacity:0.7">Generated for: ${user.fullName} | ${new Date().toLocaleDateString()}</p>
</div>
<div class="section">
  <h2>Career Domain Scores</h2>
  ${Object.entries(scores).map(([key, val]) => `
  <div class="score-bar">
    <div class="score-label"><span>${key.charAt(0).toUpperCase() + key.slice(1)}</span><span>${val}%</span></div>
    <div class="bar"><div class="bar-fill" style="width:${val}%"></div></div>
  </div>`).join('')}
</div>
<div class="section">
  <h2>Career Recommendations</h2>
  ${assessment.careerRecommendations?.map(rec => `
  <div class="career-card">
    <h3>${rec.career} - ${rec.matchScore}% Match</h3>
    <p style="color:#94a3b8;font-size:14px;margin-bottom:8px">${rec.description}</p>
    <div>${rec.skills?.map(s => `<span class="tag">${s}</span>`).join('') || ''}</div>
  </div>`).join('') || ''}
</div>
<div class="section">
  <h2>AI Insights</h2>
  <p style="color:#94a3b8;line-height:1.6">${assessment.aiInsights || ''}</p>
</div>
<div class="footer"><p>© 2024 Margadarshak AI - Your AI Career Mentor | Confidential Report</p></div>
</body></html>`;
  const pdf = await generatePDF(html);
  return uploadPDFToCloudinary(pdf, 'reports', `assessment-${assessment._id}`);
};

exports.generateRoadmapPDF = async (roadmap, user) => {
  const html = `<!DOCTYPE html><html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
body { background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; padding: 40px; }
.header { text-align: center; padding: 40px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 20px; margin-bottom: 32px; }
.header h1 { font-size: 32px; margin-bottom: 8px; }
.section { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
.section h2 { color: #3b82f6; font-size: 20px; margin-bottom: 16px; }
.milestone { border-left: 3px solid #10b981; padding-left: 16px; margin-bottom: 16px; }
.milestone h3 { color: #10b981; margin-bottom: 8px; }
.milestone li { color: #94a3b8; font-size: 14px; margin-bottom: 4px; list-style: disc; margin-left: 16px; }
.card { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
.tag { display: inline-block; background: rgba(16,185,129,0.2); color: #10b981; padding: 4px 10px; border-radius: 20px; font-size: 12px; margin: 2px; }
.footer { text-align: center; padding: 24px; color: rgba(255,255,255,0.4); font-size: 12px; }
</style></head><body>
<div class="header">
  <h1>🗺️ Learning Roadmap</h1>
  <p>${roadmap.title}</p>
  <p style="margin-top:8px;opacity:0.7">${user.fullName} | Goal: ${roadmap.careerGoal} | ${roadmap.duration} weeks</p>
</div>
<div class="section">
  <h2>Weekly Milestones</h2>
  ${roadmap.milestones?.map(m => `
  <div class="milestone">
    <h3>Week ${m.week}: ${m.title}</h3>
    <ul>${m.tasks?.map(t => `<li>${t}</li>`).join('') || ''}</ul>
  </div>`).join('') || ''}
</div>
<div class="section">
  <h2>Projects</h2>
  ${roadmap.projects?.map(p => `
  <div class="card">
    <h3 style="color:#3b82f6;margin-bottom:8px">${p.title} <span style="font-size:12px;color:#f59e0b">(${p.difficulty})</span></h3>
    <p style="color:#94a3b8;font-size:14px;margin-bottom:8px">${p.description}</p>
    <div>${p.skills?.map(s => `<span class="tag">${s}</span>`).join('') || ''}</div>
  </div>`).join('') || ''}
</div>
<div class="section">
  <h2>Certifications</h2>
  ${roadmap.certifications?.map(c => `
  <div class="card" style="display:flex;justify-content:space-between;align-items:center">
    <div><h3 style="color:#fff">${c.name}</h3><p style="color:#94a3b8;font-size:13px">${c.provider}</p></div>
    <span style="color:${c.priority==='high'?'#ef4444':c.priority==='medium'?'#f59e0b':'#10b981'};font-size:12px;text-transform:uppercase">${c.priority}</span>
  </div>`).join('') || ''}
</div>
<div class="footer"><p>© 2024 Margadarshak AI | Your AI Career Mentor</p></div>
</body></html>`;
  const pdf = await generatePDF(html);
  return uploadPDFToCloudinary(pdf, 'reports', `roadmap-${roadmap._id}`);
};

exports.generateResumePDF = async (resume, user) => {
  const html = `<!DOCTYPE html><html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
body { background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; padding: 40px; }
.header { text-align: center; padding: 40px; background: linear-gradient(135deg, #ef4444, #f59e0b); border-radius: 20px; margin-bottom: 32px; }
.score-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.score-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; text-align: center; }
.score-card .value { font-size: 36px; font-weight: bold; background: linear-gradient(135deg, #10b981, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.section { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
.section h2 { color: #f59e0b; font-size: 20px; margin-bottom: 16px; }
.item { padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #94a3b8; font-size: 14px; }
.tag { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; margin: 2px; }
.footer { text-align: center; padding: 24px; color: rgba(255,255,255,0.4); font-size: 12px; }
</style></head><body>
<div class="header">
  <h1>📄 Resume Analysis Report</h1>
  <p>${user.fullName} | Generated ${new Date().toLocaleDateString()}</p>
</div>
<div class="score-grid">
  ${Object.entries(resume.scores).map(([k,v]) => `
  <div class="score-card">
    <div class="value">${v}</div>
    <div style="color:#94a3b8;font-size:13px;text-transform:capitalize">${k} Score</div>
  </div>`).join('')}
</div>
<div class="section">
  <h2>Strengths</h2>
  ${resume.strengths?.map(s => `<div class="item">✅ ${s}</div>`).join('') || ''}
</div>
<div class="section">
  <h2>Areas for Improvement</h2>
  ${resume.improvements?.map(i => `<div class="item">⚡ ${i}</div>`).join('') || ''}
</div>
<div class="section">
  <h2>Missing Keywords</h2>
  <div>${resume.keywords?.missing?.map(k => `<span class="tag" style="background:rgba(239,68,68,0.2);color:#ef4444">${k}</span>`).join('') || 'None'}</div>
</div>
<div class="section">
  <h2>Job Match Analysis</h2>
  ${resume.jobMatches?.map(j => `
  <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:12px;margin-bottom:8px">
    <div style="display:flex;justify-content:space-between"><span>${j.role} at ${j.company}</span><span style="color:#10b981">${j.matchScore}%</span></div>
  </div>`).join('') || ''}
</div>
<div class="footer"><p>© 2024 Margadarshak AI | Your AI Career Mentor</p></div>
</body></html>`;
  const pdf = await generatePDF(html);
  return uploadPDFToCloudinary(pdf, 'reports', `resume-${resume._id}`);
};

exports.generateInterviewPDF = async (interview, user) => {
  const { scores, analytics } = interview;
  const html = `<!DOCTYPE html><html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
body { background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; padding: 40px; }
.header { text-align: center; padding: 40px; background: linear-gradient(135deg, #8b5cf6, #ec4899); border-radius: 20px; margin-bottom: 32px; }
.score-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
.score-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; text-align: center; }
.score-value { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.section { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
.section h2 { color: #8b5cf6; font-size: 20px; margin-bottom: 16px; }
.bar { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-top: 6px; }
.bar-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #8b5cf6, #ec4899); }
.item { padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #94a3b8; font-size: 14px; }
.footer { text-align: center; padding: 24px; color: rgba(255,255,255,0.4); font-size: 12px; }
</style></head><body>
<div class="header">
  <h1>🎯 Interview Performance Report</h1>
  <p>${user.fullName} | ${interview.company} - ${interview.round?.toUpperCase()} Round</p>
  <p style="opacity:0.7;margin-top:8px">${new Date(interview.completedAt || interview.createdAt).toLocaleDateString()}</p>
</div>
<div class="score-grid">
  ${Object.entries(scores).map(([k,v]) => `
  <div class="score-card">
    <div class="score-value">${v || 0}</div>
    <div style="color:#94a3b8;font-size:11px;text-transform:capitalize">${k.replace(/([A-Z])/g,' $1').trim()}</div>
  </div>`).join('')}
</div>
<div class="section">
  <h2>Communication Analytics</h2>
  ${analytics ? Object.entries({ 'Clarity Score': analytics.clarityScore, 'Vocabulary Score': analytics.vocabularyScore, 'Attention Score': analytics.attentionScore, 'Focus Score': analytics.focusScore, 'Integrity Score': analytics.integrityScore }).map(([k,v]) => `
  <div style="margin-bottom:12px">
    <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:4px"><span>${k}</span><span>${v || 0}%</span></div>
    <div class="bar"><div class="bar-fill" style="width:${v || 0}%"></div></div>
  </div>`).join('') : ''}
</div>
<div class="section">
  <h2>Strengths</h2>
  ${interview.strengths?.map(s => `<div class="item">✅ ${s}</div>`).join('') || '<div class="item">No data</div>'}
</div>
<div class="section">
  <h2>Areas for Improvement</h2>
  ${interview.improvements?.map(i => `<div class="item">⚡ ${i}</div>`).join('') || '<div class="item">No data</div>'}
</div>
<div class="section">
  <h2>AI Recommendations</h2>
  ${interview.aiRecommendations?.map(r => `<div class="item">💡 ${r}</div>`).join('') || '<div class="item">No data</div>'}
</div>
<div class="footer"><p>© 2024 Margadarshak AI | Confidential Interview Report</p></div>
</body></html>`;
  const pdf = await generatePDF(html);
  return uploadPDFToCloudinary(pdf, 'reports', `interview-${interview._id}`);
};

module.exports.generatePDF = generatePDF;
module.exports.uploadPDFToCloudinary = uploadPDFToCloudinary;
