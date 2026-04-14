// ==============================
// Margadarshak AI Roadmap
// ==============================

const token = localStorage.getItem("token")


// ==============================
// Generate Roadmap
// ==============================

async function generateRoadmap(){

const role =
document.getElementById("careerRole").value

if(!role){

showToast("Select career role")
return

}

try{

showLoader()

const res = await fetch("/api/roadmap",{

method:"POST",

headers:{
"Content-Type":"application/json",
Authorization: token
},

body:JSON.stringify({
role
})

})

const data = await res.json()

hideLoader()

displayRoadmap(data)

saveRoadmap(role)

}catch(error){

console.error("Roadmap error",error)

hideLoader()

}

}


// ==============================
// Display Roadmap
// ==============================

function displayRoadmap(data){

const container =
document.getElementById("roadmapContainer")

container.innerHTML=""

data.roadmap.forEach((step,index)=>{

const card = document.createElement("div")

card.className="glass-card roadmap-card animate-fade-in"

card.innerHTML=`

<h3>Step ${index+1}</h3>

<h4>${step.title}</h4>

<p>${step.description}</p>

<ul>

${step.skills.map(skill=>
`<li>${skill}</li>`
).join("")}

</ul>

<button class="btn btn-primary"
onclick="markComplete(${index})">

Mark Complete

</button>

`

container.appendChild(card)

})

}


// ==============================
// Mark Complete
// ==============================

function markComplete(index){

const cards =
document.querySelectorAll(".roadmap-card")

cards[index].style.opacity="0.6"

cards[index].style.border=
"1px solid #00FFB2"

updateProgress()

}


// ==============================
// Progress Update
// ==============================

function updateProgress(){

const cards =
document.querySelectorAll(".roadmap-card")

let completed = 0

cards.forEach(card=>{

if(card.style.opacity=="0.6"){
completed++
}

})

const progress =
Math.round((completed/cards.length)*100)

document.getElementById("roadmapProgress")
.innerText = progress + "%"

}


// ==============================
// Download PDF
// ==============================

function downloadRoadmap(){

window.location.href =
"/api/roadmap/report"

}


// ==============================
// Save Roadmap
// ==============================

async function saveRoadmap(role){

try{

await fetch("/api/profile/roadmap",{

method:"POST",

headers:{
"Content-Type":"application/json",
Authorization: token
},

body:JSON.stringify({
role
})

})

}catch(error){

console.error("Save error",error)

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

loader.innerHTML=`
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

toast.innerText = message

document.body.appendChild(toast)

setTimeout(()=>{
toast.remove()
},3000)

}