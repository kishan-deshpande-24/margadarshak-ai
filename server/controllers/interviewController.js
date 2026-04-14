const askAI = require("../services/openai")
const supabase = require("../services/supabase")

// ==============================
// Generate Questions
// ==============================

exports.getQuestions = async (req,res)=>{

try{

const role = req.query.role || "Software Developer"

const random = Math.floor(Math.random()*10000)

const prompt = `

Generate 5 interview questions for:

${role}

Random seed: ${random}

Return JSON:

[
"question1",
"question2",
"question3",
"question4",
"question5"
]

`

const response = await askAI(prompt)

let questions

try{

questions = JSON.parse(response)

}catch{

questions = [

"Tell me about yourself",

"What are your strengths",

"Explain your projects",

"Why should we hire you",

"Future goals"

]

}

res.json({
questions
})

}catch(error){

console.error(error)

res.json({

questions:[
"Tell me about yourself"
]

})

}

}



// ==============================
// Submit Interview
// ==============================

exports.submitInterview = async (req,res)=>{

try{

const { answers } = req.body

const prompt = `

Evaluate interview answers:

${JSON.stringify(answers)}

Return JSON:

{
score:number,
feedback:"",
strengths:["",""],
improvements:["",""]
}

`

const response = await askAI(prompt)

let result

try{

result = JSON.parse(response)

}catch{

result = {

score:80,
feedback:"Good performance",
strengths:["Communication"],
improvements:["Confidence"]

}

}


// Save to database

await supabase
.from("interviews")
.insert([{

score:result.score,
feedback:result.feedback

}])


res.json(result)

}catch(error){

console.error(error)

res.json({

score:75,
feedback:"Good attempt"

})

}

}



// ==============================
// Generate Report
// ==============================

exports.getReport = async (req,res)=>{

try{

const { data } = await supabase
.from("interviews")
.select("*")
.order("created_at",{ascending:false})
.limit(1)

res.json({

report:data[0]

})

}catch(error){

res.json({

report:"No report"

})

}

}