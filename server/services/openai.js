const axios = require("axios")

async function askAI(input, system = "You are Margadarshak AI career assistant.") {

try {

const response = await axios.post(
"https://api.groq.com/openai/v1/chat/completions",
{
model: "llama-3.3-70b-versatile",
messages: [
{ role: "system", content: system },
{ role: "user", content: input }
],
temperature: 0.7
},
{
headers: {
Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
"Content-Type": "application/json"
}
}
)

return response.data.choices[0].message.content

} catch (error) {

console.error("Groq Error:", error.response?.data || error.message)

return "AI service temporarily unavailable"

}

}

module.exports = askAI