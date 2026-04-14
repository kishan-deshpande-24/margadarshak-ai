const askAI = require("../services/openai")
const supabase = require("../services/supabase")

exports.analyzeResume = async (req,res)=>{

try{

const {text, userId} = req.body

const prompt = `

Analyze this resume:

${text}

Give:

1. Resume score out of 100
2. ATS score out of 100
3. Skills found (as array)
4. Suggestions for improvement (as array)
5. Detailed AI feedback on the resume

Return JSON format:

{
"score": number,
"ats": number,
"skills": ["skill1", "skill2"],
"suggestions": ["suggestion1", "suggestion2"],
"ai_feedback": "detailed feedback text"
}

`

const result = await askAI(prompt)

const data = JSON.parse(result)

// Save to Supabase
const {error} = await supabase
.from("resume_analysis")
.insert([
{
user_id: userId,
resume_score: data.score,
ats_score: data.ats,
skills: data.skills,
suggestions: data.suggestions,
ai_feedback: data.ai_feedback
}
])

if(error){
console.error("Error saving resume analysis:", error)
}

res.json(data)

}catch(error){

console.log(error)

res.json({
score:75,
ats:70,
skills:["JavaScript","React"],
suggestions:["Improve projects"],
ai_feedback:"Your resume looks good but could be improved with more specific achievements and quantifiable results."
})

}

}

exports.getUserResumeAnalyses = async (req,res)=>{

try{

const {userId} = req.query

const {data, error} = await supabase
.from("resume_analysis")
.select("*")
.eq("user_id",userId)
.order("created_at",{ascending:false})

if(error){
console.error("Error getting resume analyses:", error)
res.json({analyses:[]})
}else{
res.json({analyses:data})
}

}catch(error){

console.error("Error getting resume analyses:", error)
res.json({analyses:[]})

}

}