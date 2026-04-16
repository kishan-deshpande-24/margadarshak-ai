const askAI = require("../services/openai")
const supabase = require("../services/supabase")

// safer JSON extraction
function safeParse(text){
try{
const match = text.match(/\{[\s\S]*\}/)
return match ? JSON.parse(match[0]) : null
}catch{
return null
}
}

// ================= ANALYZE =================
exports.analyzeResume = async (req, res) => {

try{

const { text, userId } = req.body

if(!text){
return res.status(400).json({ error:"No text" })
}

const prompt = `
Analyze this resume:

${text}

Return ONLY JSON:
{
"score": number,
"ats": number,
"skills": ["..."],
"suggestions": ["..."],
"ai_feedback": "detailed feedback"
}
`

const response = await askAI(prompt)

let data = safeParse(response)

if(!data){
data = {
score:70,
ats:70,
skills:["Communication"],
suggestions:["Add more projects"],
ai_feedback:"Improve resume structure"
}
}

// save
await supabase.from("resumes").insert([{
user_id:userId,
resume_score:data.score,
ats_score:data.ats,
skills:data.skills,
suggestions:data.suggestions,
ai_feedback:data.ai_feedback
}])

res.json(data)

}catch(e){

res.json({
score:60,
ats:60,
skills:[],
suggestions:["Error analyzing"],
ai_feedback:"Try again"
})

}

}

// ================= GET HISTORY =================
exports.getUserResumeAnalyses = async (req,res)=>{

const { userId } = req.query

const { data } = await supabase
.from("resumes")
.select("*")
.eq("user_id", userId)
.order("created_at",{ascending:false})

res.json({ analyses:data || [] })

}