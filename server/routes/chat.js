const express = require("express")
const router = express.Router()

const askAI = require("../services/openai")

let chatHistory = []

router.post("/", async (req,res)=>{

try{

const {message} = req.body

// Save user message
chatHistory.push({
role:"user",
content:message
})

// Limit memory
if(chatHistory.length > 10){
chatHistory.shift()
}

// System prompt
const systemPrompt = `

You are Margadarshak AI Career Assistant.

You help students with:

- Career guidance
- Skills roadmap
- Resume building
- Interview preparation
- Team building
- English communication

Be concise, friendly and helpful.

`

// Combine history
const conversation = [
{role:"system", content:systemPrompt},
...chatHistory
]

// Ask AI
const reply = await askAI(conversation)

// Save AI reply
chatHistory.push({
role:"assistant",
content:reply
})

res.json({reply})

}catch(error){

console.error(error)

res.json({
reply:"AI currently unavailable. Try again."
})

}

})

module.exports = router