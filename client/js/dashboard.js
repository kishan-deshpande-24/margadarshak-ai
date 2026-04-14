// ==============================
// Margadarshak AI Dashboard
// ==============================

const token = localStorage.getItem("token")

let progressChart
let skillChart
let interviewChart


// Load Dashboard

async function loadDashboard(){

try{

showLoader()

const res = await fetch("/api/dashboard",{

headers:{
Authorization: token
}

})

const data = await res.json()

hideLoader()

loadCharts(data)

loadRecommendations(data)

loadUser()

}catch(error){

console.error("Dashboard error",error)

hideLoader()

}

}


// Load Charts

function loadCharts(data){

// Career Progress

const progressCtx = document
.getElementById("progressChart")

if(progressChart) progressChart.destroy()

progressChart = new Chart(progressCtx,{

type:"doughnut",

data:{

labels:["Completed","Remaining"],

datasets:[{

data:[data.progress,100-data.progress],

backgroundColor:[
"#7C3AED",
"#1f2937"
]

}]

},

options:{
plugins:{
legend:{
labels:{
color:"white"
}
}
}

}

})


// Skill Chart

const skillCtx = document
.getElementById("skillChart")

if(skillChart) skillChart.destroy()

skillChart = new Chart(skillCtx,{

type:"bar",

data:{

labels:data.skills,

datasets:[{

data:data.skillScores,

backgroundColor:"#00E5FF"

}]

},

options:{
plugins:{
legend:{
display:false
}
},
scales:{
y:{
ticks:{
color:"white"
}
},
x:{
ticks:{
color:"white"
}
}
}

}

})


// Interview Chart

const interviewCtx = document
.getElementById("interviewChart")

if(interviewChart) interviewChart.destroy()

interviewChart = new Chart(interviewCtx,{

type:"line",

data:{

labels:data.interviewDates,

datasets:[{

data:data.interviewScores,

borderColor:"#7C3AED",

fill:false

}]

},

options:{
plugins:{
legend:{
display:false
}
},
scales:{
y:{
ticks:{
color:"white"
}
},
x:{
ticks:{
color:"white"
}
}
}

}

})

}


// AI Recommendations

function loadRecommendations(data){

const rec = document
.getElementById("recommendations")

rec.innerHTML = `

<div class="glass-card">

<p>${data.recommendations}</p>

</div>

`

}


// Load User

function loadUser(){

const user = JSON.parse(
localStorage.getItem("user")
)

if(user){

document.getElementById("userName")
.innerText = "Hi, " + user.name

}

}


// Navigation

function go(page){

window.location.href = page

}


// Logout

function logout(){

localStorage.removeItem("token")

window.location.href="login.html"

}


// Loader

function showLoader(){

let loader = document
.getElementById("loader")

if(!loader){

loader = document.createElement("div")

loader.id="loader"

loader.innerHTML=`
<div class="loader-spinner"></div>
`

document.body.appendChild(loader)

}

loader.style.display="flex"

}


function hideLoader(){

const loader = document
.getElementById("loader")

if(loader)
loader.style.display="none"

}


// Init

document.addEventListener("DOMContentLoaded",()=>{

loadDashboard()

})