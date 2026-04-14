let currentQuestion = 0
let questions = []
let answers = []

const progressBar = document.getElementById("progress-bar")

// Start Assessment
async function startAssessment(){

document.getElementById("start-screen").style.display="none"
document.getElementById("question-screen").style.display="block"

await loadQuestions()

showQuestion()

}

// Load Questions from API
async function loadQuestions(){

try{

showLoader()

const res = await fetch("/api/assessment")

const data = await res.json()

questions = data.questions || []

hideLoader()

}catch(error){

console.error(error)

alert("Failed to load questions")

}

}

// Show Question
function showQuestion(){

const q = questions[currentQuestion]

document.getElementById("question-number").innerText =
`Question ${currentQuestion+1} of ${questions.length}`

document.getElementById("question").innerText = q.question

updateProgress()

const options = document.getElementById("options")

options.innerHTML=""

q.options.forEach(option=>{

const btn = document.createElement("button")

btn.className="btn option-btn animate-fade-in"

btn.innerText = option

btn.onclick = ()=> selectAnswer(option)

options.appendChild(btn)

})

}

// Select Answer
function selectAnswer(answer){

answers.push(answer)

currentQuestion++

if(currentQuestion < questions.length){

showQuestion()

}else{

submitAssessment()

}

}

// Submit Assessment
async function submitAssessment(){

showLoader()

try{

const res = await fetch("/api/assessment/submit",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
answers
})

})

const data = await res.json()

document.getElementById("question-screen").style.display="none"
document.getElementById("result-screen").style.display="block"

document.getElementById("result").innerHTML = data.result

hideLoader()

}catch(error){

console.error(error)

alert("Error submitting assessment")

}

}

// Progress Bar
function updateProgress(){

if(!progressBar) return

const progress =
((currentQuestion)/questions.length)*100

progressBar.style.width = progress + "%"

}

// Loader
function showLoader(){

let loader = document.getElementById("loader")

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

const loader = document.getElementById("loader")

if(loader) loader.style.display="none"

}

// Go To Roadmap
function goToRoadmap(){

window.location.href="roadmap.html"

}

// Restart Assessment
function restartAssessment(){

currentQuestion = 0
answers = []

document.getElementById("result-screen").style.display="none"
document.getElementById("start-screen").style.display="block"

}

// Logout
function logout(){

localStorage.removeItem("token")
window.location.href="login.html"

}