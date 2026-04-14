const askAI = require("../services/openai")
const supabase = require("../services/supabase")

exports.getQuestions = async (req,res)=>{

try{

const prompt = `

Generate 10 career assessment questions.

Each question must include 4 options.

Return JSON format:

[
{
question:"",
options:[]
}
]

`

const response = await askAI(prompt)

const questions = JSON.parse(response)

res.json({
questions
})

}catch(error){

console.log(error)

res.json({
questions:[
{
question:"Which field interests you most?",
options:["AI","Web Dev","Data","Cyber Security"]
}
]
})

}

}



exports.submitAssessment = async (req,res)=>{

try{

const {answers} = req.body

const prompt = `

User answers:

${answers}

Suggest career path and explanation.

`

const result = await askAI(prompt)

res.json({
result
})

}catch(error){

res.json({
result:"Software Developer"
})

}

}

// Generate assessment questions based on roadmap
exports.generateAssessment = async (req,res)=>{

try{

const {prompt, userId} = req.body

console.log("Generating assessment for userId:", userId)
console.log("Prompt:", prompt)

const response = await askAI(prompt)

console.log("Groq API response received")

const data = JSON.parse(response)

console.log("Parsed data:", data)

res.json(data)

}catch(error){

console.error("Error generating assessment:", error)
console.error("Error details:", error.message)

res.status(500).json({
error:"Failed to generate assessment questions",
details: error.message
})

}

}

// Save assessment to database
exports.saveAssessment = async (req,res)=>{

try{

const {assessment, userId} = req.body

const {data, error} = await supabase
.from("assessments")
.insert([{
user_id: userId,
career: assessment.career,
skills: assessment.skills,
tech_stack: assessment.techStack,
questions: assessment.questions,
answers: assessment.answers,
score: assessment.score,
completed_at: assessment.completedAt
}])
.select()

if(error){
throw error
}

res.json({
success: true,
assessment: data[0]
})

}catch(error){

console.error("Error saving assessment:", error)

res.status(500).json({
error:"Failed to save assessment"
})

}

}

// Get user assessments
exports.getUserAssessments = async (req,res)=>{

try{

const {userId} = req.query

const {data, error} = await supabase
.from("assessments")
.select("*")
.eq("user_id", userId)
.order("completed_at", {ascending: false})

if(error){
throw error
}

res.json({
assessments: data || []
})

}catch(error){

console.error("Error fetching assessments:", error)

res.status(500).json({
error:"Failed to fetch assessments"
})

}

}