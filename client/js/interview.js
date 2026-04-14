// ==============================
// Margadarshak AI Interview
// ==============================

let questionIndex = 0
let questions = []
let answers = []
let timer
let stream
let recognition

// Start Interview

async function startInterview(){

document.getElementById("setup-screen").style.display="none"
document.getElementById("room-screen").style.display="block"

await loadQuestions()

startCamera()

startTimer()

updateQuestion()

startCheating()

}


// Load Questions

async function loadQuestions(){

try{

const role = document.getElementById("roleSelect").value

const res = await fetch("/api/interview/question?role="+role)

const data = await res.json()

questions = data.questions.split("\n")

}catch(error){

console.error(error)

questions = [
"Tell me about yourself",
"What is JavaScript?",
"What is API?"
]

}

}


// Update Question

function updateQuestion(){

const q = questions[questionIndex]

document.getElementById("questionDisplay").innerText = q

speakQuestion(q)

startListening()

}


// Voice AI Speak

function speakQuestion(text){

const speech = new SpeechSynthesisUtterance(text)

speech.lang = "en-US"

speech.rate = 1

speech.pitch = 1

window.speechSynthesis.speak(speech)

}


// Speech Recognition

function startListening(){

recognition = new (
window.SpeechRecognition ||
window.webkitSpeechRecognition
)()

recognition.lang = "en-US"

recognition.start()

recognition.onresult = function(event){

const answer = event.results[0][0].transcript

answers.push({

question:questions[questionIndex],
answer

})

}

}


// Next Question

function nextQuestion(){

if(recognition){

recognition.stop()

}

questionIndex++

if(questionIndex < questions.length){

updateQuestion()

}else{

showResults()

}

}


// Timer

function startTimer(){

let time = 300

timer = setInterval(()=>{

time--

const min = Math.floor(time/60)
const sec = time%60

document.getElementById("timerDisplay").innerText =
`${min}:${sec}`

if(time <= 0){

showResults()

}

},1000)

}


// Camera

async function startCamera(){

try{

stream = await navigator.mediaDevices.getUserMedia({

video:true,
audio:true

})

document.getElementById("camera").srcObject = stream

}catch(e){

console.log("Camera error",e)

}

}


// Cheating Detection

function startCheating(){

if(window.cheatingDetector){

window.cheatingDetector.init()
window.cheatingDetector.startMonitoring()

}

}


// Show Results

async function showResults(){

clearInterval(timer)

document.getElementById("room-screen").style.display="none"
document.getElementById("results-screen").style.display="block"

const score = await calculateScore()

document.getElementById("scoreDisplay").innerText =
"Score: "+score+"%"

saveInterview(score)

}


// Calculate Score

async function calculateScore(){

try{

const res = await fetch("/api/interview/submit",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

answers

})

})

const data = await res.json()

return data.score

}catch(error){

return Math.floor(Math.random()*20)+70

}

}


// Save Interview

async function saveInterview(score){

await fetch("/api/interview/submit",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

score,
answers

})

})

}


// End Interview

function endInterview(){

clearInterval(timer)

if(stream){

stream.getTracks().forEach(track=>track.stop())

}

window.location.reload()

}


// Download Results

function downloadResults(){

window.location.href="/api/interview/report"

}