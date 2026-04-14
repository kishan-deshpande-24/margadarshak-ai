const supabase = require("../services/supabase")
const jwt = require("jsonwebtoken")

// ==============================
// Signup
// ==============================

exports.signup = async (req, res) => {

try{

const { name, email, password } = req.body

// Create user in Supabase Auth

const { data, error } = await supabase.auth.signUp({

email,
password,

options:{
data:{
name
}
}

})

if(error){

return res.status(400).json({
message:error.message
})

}

// Create profile

await supabase
.from("profiles")
.insert([{

id:data.user.id,
name,
email

}])


res.json({

message:"Signup successful",
user:data.user

})

}catch(error){

console.error(error)

res.status(500).json({
message:"Server error"
})

}

}



// ==============================
// Login
// ==============================

exports.login = async (req, res) => {

try{

const { email, password } = req.body

const { data, error } = await supabase.auth.signInWithPassword({

email,
password

})

if(error){

return res.status(400).json({
message:error.message
})

}

// Generate JWT

const token = jwt.sign({

userId:data.user.id

},

process.env.JWT_SECRET,

{
expiresIn:"7d"
}

)

res.json({

token,
user:data.user

})

}catch(error){

console.error(error)

res.status(500).json({
message:"Server error"
})

}

}



// ==============================
// Verify User
// ==============================

exports.verify = async (req, res) => {

try{

const token = req.headers.authorization

if(!token){

return res.status(401).json({
message:"Unauthorized"
})

}

const decoded = jwt.verify(
token,
process.env.JWT_SECRET
)

res.json({
user:decoded
})

}catch(error){

res.status(401).json({
message:"Invalid token"
})

}

}