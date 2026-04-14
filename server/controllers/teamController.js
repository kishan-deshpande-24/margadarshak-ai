const supabase = require("../services/supabase")

// ==============================
// Create Team
// ==============================

exports.createTeam = async (req,res)=>{

try{

const { name, description, userId } = req.body

const { data, error } = await supabase
.from("teams")
.insert([{

name,
description,
created_by:userId

}])
.select()

if(error) throw error

res.json(data)

}catch(error){

console.error(error)

res.status(500).json({

message:"Error creating team"

})

}

}



// ==============================
// Get Teams
// ==============================

exports.getTeams = async (req,res)=>{

try{

const { data, error } = await supabase
.from("teams")
.select("*")
.order("created_at",{ascending:false})

if(error) throw error

res.json(data)

}catch(error){

res.status(500).json([])

}

}



// ==============================
// Join Team
// ==============================

exports.joinTeam = async (req,res)=>{

try{

const { teamId, userId } = req.body

await supabase
.from("team_members")
.insert([{

team_id:teamId,
user_id:userId

}])

res.json({

message:"Joined team"

})

}catch(error){

res.status(500).json({

message:"Error joining"

})

}

}



// ==============================
// Leave Team
// ==============================

exports.leaveTeam = async (req,res)=>{

try{

const { teamId, userId } = req.body

await supabase
.from("team_members")
.delete()
.eq("team_id",teamId)
.eq("user_id",userId)

res.json({

message:"Left team"

})

}catch(error){

res.status(500).json({

message:"Error leaving"

})

}

}



// ==============================
// Get Team Members
// ==============================

exports.getMembers = async (req,res)=>{

try{

const { teamId } = req.query

const { data } = await supabase
.from("team_members")
.select("*")
.eq("team_id",teamId)

res.json(data)

}catch(error){

res.json([])

}

}