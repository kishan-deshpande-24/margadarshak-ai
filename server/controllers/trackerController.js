const supabase = require("../services/supabase")

exports.getTracker = async (req,res)=>{

try{

const {userId} = req.query

console.log("getTracker called with userId:", userId)

const {data, error} = await supabase
.from("tracker")
.select("*")
.eq("user_id",userId)
.order("created_at",{ascending:false})

console.log("Supabase query result:", {data, error})

if(error){
console.error("Supabase error:", error)
// Try without user_id filter to see if data exists
const {data: allData, error: allError} = await supabase
.from("tracker")
.select("*")
.order("created_at",{ascending:false})
console.log("All tracker data (no filter):", allData)
res.json(allData || [])
}else{
res.json(data)
}

}catch(error){

console.error("Error getting tracker:", error)
res.json([])

}

}

exports.addCompany = async (req,res)=>{

try{

const {company,role,status,userId} = req.body

console.log("addCompany called with:", {company, role, status, userId})

const {data, error} = await supabase
.from("tracker")
.insert([
{
company,
role,
status,
user_id:userId
}
])

console.log("Insert result:", {data, error})

res.json({
message:"Added"
})

}catch(error){

console.error("Error adding company:", error)
res.json({
message:"Error"
})

}

}

exports.deleteCompany = async (req,res)=>{

try{

const {id} = req.params

await supabase
.from("tracker")
.delete()
.eq("id",id)

res.json({
message:"Deleted"
})

}catch(error){

console.error("Error deleting company:", error)
res.json({
message:"Error"
})

}

}

exports.updateStatus = async (req,res)=>{

try{

const {id} = req.params
const {status} = req.body

const {data} = await supabase
.from("tracker")
.update({status})
.eq("id",id)

res.json({
message:"Status updated"
})

}catch(error){

console.error("Error updating status:", error)
res.json({
message:"Error"
})

}

}