const supabase = require("../services/supabase")

exports.getTracker = async (req,res)=>{

try{

const {data} = await supabase
.from("tracker")
.select("*")
.order("created_at",{ascending:false})

res.json(data)

}catch(error){

res.json([])

}

}



exports.addCompany = async (req,res)=>{

try{

const {company,role,status} = req.body

const {data} = await supabase
.from("tracker")
.insert([
{
company,
role,
status
}
])

res.json({
message:"Added"
})

}catch(error){

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

res.json({
message:"Error"
})

}

}