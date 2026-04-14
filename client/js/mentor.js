async function sendMessage(){

const input = document.getElementById("mentorInput")

const message = input.value

if(!message) return

addMessage("user",message)

input.value=""

const res = await fetch("/api/mentor",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
message
})

})

const data = await res.json()

addMessage("ai",data.reply)

speak(data.reply)

}


// Voice

function startVoice(){

const recognition = new(window.SpeechRecognition || window.webkitSpeechRecognition)()

recognition.lang="en-US"

recognition.start()

recognition.onresult = (e)=>{

const text = e.results[0][0].transcript

document.getElementById("mentorInput").value = text

sendMessage()

}

}


// Interview

async function startInterview(){

const res = await fetch("/api/mentor/interview",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
topic:"General"
})

})

const data = await res.json()

addMessage("ai",data.question)

speak(data.question)

}


// Daily Challenge

async function loadChallenge(){

const res = await fetch("/api/mentor/challenge")

const data = await res.json()

document.getElementById("dailyChallenge").innerText =
data.challenge

}


// Speak

function speak(text){

const speech = new SpeechSynthesisUtterance(text)

speech.lang="en-US"

window.speechSynthesis.speak(speech)

}


// Chat UI

function addMessage(type,text){

const chat = document.getElementById("mentorChat")

const div = document.createElement("div")

div.className="mentor-message "+type

div.innerText=text

chat.appendChild(div)

chat.scrollTop=chat.scrollHeight

}