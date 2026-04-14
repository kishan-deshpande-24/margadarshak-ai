const supabase = require("../services/supabase")
const askAI = require("../services/openai")

// ==============================
// Get Dashboard Data
// ==============================

exports.getDashboard = async (req, res) => {

try{

// Get latest assessment

const { data: assessment } = await supabase
.from("assessment")
.select("*")
.order("created_at", { ascending: false })
.limit(1)


// Get interview scores

const { data: interviews } = await supabase
.from("interviews")
.select("*")


// Get resume score

const { data: resume } = await supabase
.from("resume")
.select("*")
.order("created_at",{ascending:false})
.limit(1)



// Default values

let progress = 50
let skills = ["HTML","CSS","JavaScript"]
let skillScores = [60,70,80]

let interviewDates = ["Week 1","Week 2"]
let interviewScores = [60,70]

let recommendations = "Continue learning"



if(assessment && assessment.length > 0){

progress = assessment[0].confidence || 70

skills = assessment[0].skills || skills

skillScores = skills.map(()=>Math.floor(Math.random()*40)+60)

}


if(interviews && interviews.length){

interviewDates = interviews.map((i,index)=>`Test ${index+1}`)

interviewScores = interviews.map(i=>i.score)

}


if(resume && resume.length){

progress = Math.max(progress,resume[0].score || 70)

}


// AI Recommendations

const prompt = `

User skills:

${skills}

Give 3 short recommendations

`

const ai = await askAI(prompt)

recommendations = ai


res.json({

progress,

skills,

skillScores,

interviewDates,

interviewScores,

recommendations

})

}catch(error){

console.error(error)

res.status(500).json({

error:"Dashboard error"

})

}

}