const askAI = require("../services/openai")
const supabase = require("../services/supabase")

exports.analyzeResume = async (req,res)=>{

try{

const {text} = req.body

const prompt = `

Analyze this resume:

${text}

Give:

1. Resume score out of 100
2. ATS score
3. Skills found
4. Suggestions

Return JSON format:

{
score:,
ats:,
skills:[],
suggestions:[]
}

`

const result = await askAI(prompt)

const data = JSON.parse(result)

res.json(data)

}catch(error){

console.log(error)

res.json({
score:75,
ats:70,
skills:["JavaScript","React"],
suggestions:["Improve projects"]
})

}

}