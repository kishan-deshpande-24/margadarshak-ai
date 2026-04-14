// ==============================
// Chat Toggle
// ==============================

function toggleChat(){

const chat = document.getElementById("chatbox")

chat.classList.toggle("active")

document.getElementById("chatInput").focus()

}


// ==============================
// Send Chat
// ==============================

async function sendChat(e){

if(e && e.key !== "Enter") return

const input = document.getElementById("chatInput")

const message = input.value.trim()

if(!message) return

addMessage("user", message)

input.value = ""

showTyping()

try{

const res = await fetch("/api/chat",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
message
})

})

const data = await res.json()

removeTyping()

addMessage("ai", data.reply)

}catch(error){

removeTyping()

addMessage("ai","AI is currently unavailable. Please try again.")

}

}


// ==============================
// Add Message
// ==============================

function addMessage(type,text){

const chatBody = document.getElementById("chatBody")

const div = document.createElement("div")

div.className = "chat-message "+type

div.innerText = text

chatBody.appendChild(div)

chatBody.scrollTop = chatBody.scrollHeight

}


// ==============================
// Typing Animation
// ==============================

function showTyping(){

const chatBody = document.getElementById("chatBody")

const div = document.createElement("div")

div.className = "chat-message ai typing"

div.id = "typing"

div.innerText = "AI is typing..."

chatBody.appendChild(div)

chatBody.scrollTop = chatBody.scrollHeight

}

function removeTyping(){

const typing = document.getElementById("typing")

if(typing){

typing.remove()

}

}


// ==============================
// Auto Scroll Fix
// ==============================

document.addEventListener("DOMContentLoaded",()=>{

const chatInput = document.getElementById("chatInput")

if(chatInput){

chatInput.addEventListener("keypress",sendChat)

}

})


// ==============================
// Smooth Animations
// ==============================

window.addEventListener("load",()=>{

document.body.classList.add("animate-fade-in")

})


// ==============================
// Floating Chat Animation
// ==============================

const chatToggle = document.querySelector(".chatbot-toggle")

if(chatToggle){

chatToggle.addEventListener("mouseenter",()=>{

chatToggle.style.transform = "scale(1.1)"

})

chatToggle.addEventListener("mouseleave",()=>{

chatToggle.style.transform = "scale(1)"

})

}