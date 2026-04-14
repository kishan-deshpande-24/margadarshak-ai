const askAI = require("../services/openai")
const supabase = require("../services/supabase")

// ===============================
// Live Conversation
// ===============================

exports.chatMentor = async (req,res)=>{

try{

const { message, userId } = req.body

const prompt = `

You are an English speaking mentor.

User said:
"${message}"

Do:

1. Correct grammar
2. Improve sentence
3. Give speaking score (1-10)
4. Give fluency feedback
5. Ask follow-up question

Format:

Corrected:
Improved:
Fluency Score:
Confidence Score:
Feedback:
Next Question:

`

const reply = await askAI(prompt)


// Save progress

await supabase
.from("mentor_sessions")
.insert([{

user_id:userId,
message,
reply

}])

res.json({reply})

}catch(error){

console.log(error)

res.json({
reply:"Let's continue speaking"
})

}

}



// ===============================
// Speaking Interview
// ===============================

exports.mockInterview = async (req,res)=>{

try{

const { topic } = req.body

const prompt = `

Act as English speaking interviewer.

Topic: ${topic}

Ask one interview speaking question.

`

const question = await askAI(prompt)

res.json({
question
})

}catch(error){

res.json({
question:"Tell me about yourself"
})

}

}



// ===============================
// Daily Challenge
// ===============================

exports.dailyChallenge = async (req,res)=>{

try{

const prompt = `

Give today's English speaking challenge.

Include:

Topic
Task
Example

`

const challenge = await askAI(prompt)

res.json({
challenge
})

}catch(error){

res.json({
challenge:"Describe your day"
})

}

}



// ===============================
// Speaking Progress
// ===============================

exports.getProgress = async (req,res)=>{

try{

const { userId } = req.query

const { data } = await supabase
.from("mentor_sessions")
.select("*")
.eq("user_id",userId)
.order("created_at",{ascending:false})
.limit(10)

res.json(data)

}catch(error){

res.json([])

}

}