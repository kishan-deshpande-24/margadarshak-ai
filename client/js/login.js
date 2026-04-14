const form = document.getElementById("loginForm")

form.addEventListener("submit", async (e) => {

e.preventDefault()

const email = document.getElementById("email").value
const password = document.getElementById("password").value

try{

const res = await fetch("/api/auth/login",{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email,
password
})

})

const data = await res.json()

if(res.ok){

// Save token
localStorage.setItem("token",data.token)

// Redirect to dashboard
window.location.href = "dashboard.html"

}else{

alert(data.message || "Login failed")

}

}catch(error){

console.log(error)
alert("Something went wrong")

}

})