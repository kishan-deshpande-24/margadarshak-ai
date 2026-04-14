// ==============================
// Margadarshak AI Profile
// ==============================

const token = localStorage.getItem("token")


// ==============================
// Load Profile
// ==============================

async function loadProfile(){

try{

showLoader()

const res = await fetch("/api/profile",{

headers:{
Authorization: token
}

})

const data = await res.json()

hideLoader()

displayProfile(data)

}catch(error){

console.error("Profile error",error)

hideLoader()

}

}


// ==============================
// Display Profile
// ==============================

function displayProfile(data){

// User Info

document.getElementById("profileName").innerText =
data.name || "User"

document.getElementById("profileEmail").innerText =
data.email || "-"

document.getElementById("profileRole").innerText =
data.role || "Student"


// Stats

document.getElementById("assessmentScore").innerText =
data.assessment || "0"

document.getElementById("resumeScore").innerText =
data.resume || "0"

document.getElementById("interviewScore").innerText =
data.interview || "0"


// Skills

loadSkills(data.skills)

}


// ==============================
// Load Skills
// ==============================

function loadSkills(skills){

const container = document
.getElementById("skillsContainer")

if(!skills || skills.length === 0){

container.innerHTML = "No skills yet"

return

}

container.innerHTML = ""

skills.forEach(skill=>{

const div = document.createElement("div")

div.className = "skill-badge"

div.innerText = skill

container.appendChild(div)

})

}


// ==============================
// Edit Profile
// ==============================

function editProfile(){

document.getElementById("editModal")
.style.display = "flex"

}


// ==============================
// Save Profile
// ==============================

async function saveProfile(){

const name =
document.getElementById("editName").value

const role =
document.getElementById("editRole").value

try{

showLoader()

await fetch("/api/profile",{

method:"PUT",

headers:{
"Content-Type":"application/json",
Authorization: token
},

body:JSON.stringify({

name,
role

})

})

hideLoader()

closeModal()

loadProfile()

}catch(error){

console.error("Save error",error)

}

}


// ==============================
// Close Modal
// ==============================

function closeModal(){

document.getElementById("editModal")
.style.display = "none"

}


// ==============================
// Loader
// ==============================

function showLoader(){

let loader =
document.getElementById("loader")

if(!loader){

loader =
document.createElement("div")

loader.id = "loader"

loader.innerHTML =
`<div class="loader-spinner"></div>`

document.body.appendChild(loader)

}

loader.style.display = "flex"

}


function hideLoader(){

const loader =
document.getElementById("loader")

if(loader){

loader.style.display = "none"

}

}


// ==============================
// Init
// ==============================

document.addEventListener("DOMContentLoaded",()=>{

loadProfile()

})