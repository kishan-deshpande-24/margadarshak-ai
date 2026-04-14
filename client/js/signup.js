const signupForm = document.getElementById("signupForm")

signupForm.addEventListener("submit", async (e)=>{

e.preventDefault()

const name = document.getElementById("name").value
const email = document.getElementById("email").value
const password = document.getElementById("password").value

try{

const res = await fetch("/api/auth/signup",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
name,
email,
password
})

})

const data = await res.json()

if(res.ok){

alert("Account created successfully")

// Redirect to login
window.location.href = "login.html"

}else{

alert(data.message)

}

}catch(err){

console.log(err)
alert("Signup failed")

}

})