// ==============================
// Margadarshak AI Settings
// ==============================

const token = localStorage.getItem("token")


// ==============================
// Load Settings
// ==============================

async function loadSettings(){

try{

showLoader()

const res = await fetch("/api/profile/settings",{

headers:{
Authorization: token
}

})

const data = await res.json()

hideLoader()

displaySettings(data)

}catch(error){

console.error("Settings error",error)

hideLoader()

}

}


// ==============================
// Display Settings
// ==============================

function displaySettings(data){

document.getElementById("name").value =
data.name || ""

document.getElementById("email").value =
data.email || ""

document.getElementById("notifications").checked =
data.notifications || false

}


// ==============================
// Save Settings
// ==============================

async function saveSettings(){

const name =
document.getElementById("name").value

const notifications =
document.getElementById("notifications").checked

try{

showLoader()

await fetch("/api/profile/settings",{

method:"PUT",

headers:{
"Content-Type":"application/json",
Authorization: token
},

body:JSON.stringify({
name,
notifications
})

})

hideLoader()

showToast("Settings saved")

}catch(error){

console.error("Save error",error)

hideLoader()

}

}


// ==============================
// Change Password
// ==============================

async function changePassword(){

const oldPassword =
document.getElementById("oldPassword").value

const newPassword =
document.getElementById("newPassword").value

if(!oldPassword || !newPassword){

showToast("Fill all fields")
return

}

try{

showLoader()

await fetch("/api/auth/change-password",{

method:"POST",

headers:{
"Content-Type":"application/json",
Authorization: token
},

body:JSON.stringify({

oldPassword,
newPassword

})

})

hideLoader()

showToast("Password updated")

}catch(error){

console.error("Password error",error)

hideLoader()

}

}


// ==============================
// Toggle Theme
// ==============================

function toggleTheme(){

document.body.classList.toggle("light-mode")

localStorage.setItem(
"theme",
document.body.classList.contains("light-mode")
)

}


// ==============================
// Logout
// ==============================

function logout(){

localStorage.clear()

window.location.href = "login.html"

}


// ==============================
// Delete Account
// ==============================

async function deleteAccount(){

if(!confirm("Delete account?")) return

try{

showLoader()

await fetch("/api/profile/delete",{

method:"DELETE",

headers:{
Authorization: token
}

})

hideLoader()

logout()

}catch(error){

console.error("Delete error",error)

hideLoader()

}

}


// ==============================
// Loader
// ==============================

function showLoader(){

let loader = document.getElementById("loader")

if(!loader){

loader = document.createElement("div")

loader.id="loader"

loader.innerHTML = `
<div class="loader-spinner"></div>
`

document.body.appendChild(loader)

}

loader.style.display="flex"

}


function hideLoader(){

const loader = document.getElementById("loader")

if(loader){

loader.style.display="none"

}

}


// ==============================
// Toast
// ==============================

function showToast(message){

let toast = document.createElement("div")

toast.className="toast"

toast.innerText=message

document.body.appendChild(toast)

setTimeout(()=>{

toast.remove()

},3000)

}


// ==============================
// Init
// ==============================

document.addEventListener("DOMContentLoaded",()=>{

loadSettings()

})