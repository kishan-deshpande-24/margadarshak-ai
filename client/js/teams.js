// ==============================
// Margadarshak AI Team Finder
// ==============================

const token = localStorage.getItem("token")


// ==============================
// Load Teams
// ==============================

async function loadTeams(){

try{

showLoader()

const res = await fetch("/api/teams")

const teams = await res.json()

hideLoader()

displayTeams(teams)

}catch(error){

console.error("Teams error",error)

hideLoader()

}

}


// ==============================
// Display Teams
// ==============================

function displayTeams(teams){

const container =
document.getElementById("teamsContainer")

container.innerHTML = ""

if(!teams.length){

container.innerHTML =
"<p>No teams available</p>"

return

}

teams.forEach(team=>{

const card =
document.createElement("div")

card.className =
"glass-card team-card animate-fade-in"

card.innerHTML = `

<h3>${team.name}</h3>

<p>${team.description}</p>

<p><strong>Members:</strong> ${team.members.length}</p>

<button 
class="btn btn-primary"
onclick="joinTeam('${team.id}')"
>

Join Team

</button>

`

container.appendChild(card)

})

}


// ==============================
// Create Team
// ==============================

async function createTeam(){

const name =
document.getElementById("teamName").value

const description =
document.getElementById("teamDesc").value

if(!name || !description){

showToast("Fill all fields")
return

}

try{

showLoader()

await fetch("/api/teams",{

method:"POST",

headers:{
"Content-Type":"application/json",
Authorization: token
},

body:JSON.stringify({

name,
description

})

})

hideLoader()

showToast("Team created")

loadTeams()

}catch(error){

console.error("Create error",error)

hideLoader()

}

}


// ==============================
// Join Team
// ==============================

async function joinTeam(id){

try{

await fetch(`/api/teams/join/${id}`,{

method:"POST",

headers:{
Authorization: token
}

})

showToast("Joined team")

loadTeams()

}catch(error){

console.error("Join error",error)

}

}


// ==============================
// Leave Team
// ==============================

async function leaveTeam(id){

try{

await fetch(`/api/teams/leave/${id}`,{

method:"POST",

headers:{
Authorization: token
}

})

showToast("Left team")

loadTeams()

}catch(error){

console.error("Leave error",error)

}

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

loader.id="loader"

loader.innerHTML = `
<div class="loader-spinner"></div>
`

document.body.appendChild(loader)

}

loader.style.display="flex"

}


function hideLoader(){

const loader =
document.getElementById("loader")

if(loader){

loader.style.display="none"

}

}


// ==============================
// Toast
// ==============================

function showToast(message){

let toast =
document.createElement("div")

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

loadTeams()

})