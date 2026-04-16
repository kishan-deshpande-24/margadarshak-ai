const askAI = require("../services/openai")
const supabase = require("../services/supabase")

// ================= START =================
exports.startInterview = async (req,res)=>{
  const { role } = req.query

  res.json({
    question: `Introduce yourself and your experience in ${role}.`,
    stage: "intro"
  })
}

// ================= NEXT =================
exports.nextQuestion = async (req,res)=>{
  try{

    const { answer, role, stage } = req.body

    let nextStage = "easy"

    if(stage === "intro") nextStage = "easy"
    else if(stage === "easy") nextStage = "medium"
    else if(stage === "medium") nextStage = "hard"
    else if(stage === "hard") nextStage = "coding"
    else if(stage === "coding") nextStage = "whiteboard"
    else if(stage === "whiteboard") nextStage = "behavioral"
    else nextStage = "final"

    const prompt = `
You are a FAANG interviewer.

Candidate answer:
"${answer}"

Role: ${role}
Current stage: ${stage}
Next stage: ${nextStage}

STRICT RULES:
- Return ONLY JSON
- No explanation
- No markdown
- No extra text

FORMAT:
{
  "feedback": "1-2 line realistic feedback",
  "nextQuestion": "next interview question",
  "stage": "${nextStage}"
}
`

    const response = await askAI(prompt)

    let data

    try{
      const match = response.match(/\{[\s\S]*\}/)
      data = JSON.parse(match[0])
    }catch{
      data = {
        feedback:"Good attempt, but add more depth.",
        nextQuestion:"Can you explain more with an example?",
        stage: nextStage
      }
    }

    res.json(data)

  }catch(e){
    console.error(e)
    res.json({
      feedback:"Try to be more clear.",
      nextQuestion:"Explain again with details.",
      stage:"medium"
    })
  }
}

// ================= FINAL =================
exports.submitInterview = async (req,res)=>{

  const { answers } = req.body

  const prompt = `
Evaluate interview:

${JSON.stringify(answers)}

Return JSON:
{
score: number,
feedback: "",
strengths: [],
improvements: []
}
`

  const response = await askAI(prompt)

  let result

  try{
    const match = response.match(/\{[\s\S]*\}/)
    result = JSON.parse(match[0])
  }catch{
    result = {
      score:75,
      feedback:"Good overall performance",
      strengths:["Basic understanding"],
      improvements:["Go deeper technically"]
    }
  }

  await supabase.from("interviews").insert([{
    score:result.score,
    feedback:result.feedback
  }])

  res.json(result)
}