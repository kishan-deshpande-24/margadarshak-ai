const askAI = require("../services/openai")
const supabase = require("../services/supabase")

// ==============================
// Generate Roadmap
// ==============================

exports.generateRoadmap = async (req,res)=>{

try{

const { career, userId } = req.body

const prompt = `

Create learning roadmap for:

${career}

Return JSON:

[
{
title:"",
description:"",
duration:""
}
]

`

const response = await askAI(prompt)

let roadmap

try{

roadmap = JSON.parse(response)

}catch{

roadmap = [

{
title:"Learn Basics",
description:"Start fundamentals",
duration:"2 weeks"
}

]

}


// Save roadmap

await supabase
.from("roadmap")
.insert([{

user_id:userId,
career,
roadmap

}])


res.json({
roadmap
})

}catch(error){

console.error(error)

res.json({

roadmap:[]

})

}

}



// ==============================
// Get Roadmap
// ==============================

exports.getRoadmap = async (req,res)=>{

try{

const { userId } = req.query

const { data } = await supabase
.from("roadmap")
.select("*")
.eq("user_id",userId)
.order("created_at",{ascending:false})
.limit(1)

res.json(data[0] || {})

}catch(error){

res.json({})

}

}



// ==============================
// Update Progress
// ==============================

exports.updateProgress = async (req,res)=>{

try{

const { id, progress } = req.body

await supabase
.from("roadmap")
.update({

progress

})
.eq("id", id)

res.json({

message:"Progress updated"

})

}catch(error){

res.json({

message:"Error updating"

})

}

}