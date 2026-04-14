const supabase = require("../services/supabase")

// ==============================
// Get Profile
// ==============================

exports.getProfile = async (req,res)=>{

try{

const { userId } = req.query

const { data, error } = await supabase
.from("profiles")
.select("*")
.eq("id", userId)
.single()

if(error) throw error

res.json(data)

}catch(error){

console.error(error)

res.status(500).json({
message:"Error fetching profile"
})

}

}



// ==============================
// Update Profile
// ==============================

exports.updateProfile = async (req,res)=>{

try{

const { userId, name, role } = req.body

await supabase
.from("profiles")
.update({
name,
role
})
.eq("id", userId)

res.json({
message:"Profile updated"
})

}catch(error){

console.error(error)

res.status(500).json({
message:"Error updating profile"
})

}

}



// ==============================
// Get Profile Stats
// ==============================

exports.getProfileStats = async (req,res)=>{

try{

const { userId } = req.query


// Assessment

const { data: assessment } = await supabase
.from("assessment")
.select("*")
.eq("user_id", userId)
.order("created_at",{ascending:false})
.limit(1)


// Resume

const { data: resume } = await supabase
.from("resume")
.select("*")
.eq("user_id", userId)
.order("created_at",{ascending:false})
.limit(1)


// Interview

const { data: interview } = await supabase
.from("interviews")
.select("*")
.eq("user_id", userId)
.order("created_at",{ascending:false})
.limit(1)


res.json({

assessmentScore:
assessment?.[0]?.confidence || 0,

resumeScore:
resume?.[0]?.score || 0,

interviewScore:
interview?.[0]?.score || 0,

skills:
assessment?.[0]?.skills || []

})

}catch(error){

console.error(error)

res.json({

assessmentScore:0,
resumeScore:0,
interviewScore:0,
skills:[]

})

}

}