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