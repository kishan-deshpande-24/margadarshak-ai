// ==============================
// Margadarshak AI Layout System
// ==============================


// ==============================
// Sidebar Toggle (Mobile)
// ==============================

function toggleSidebar(){

const sidebar = document.querySelector(".sidebar")

if(sidebar){

sidebar.classList.toggle("active")

}

}


// ==============================
// Sidebar Collapse (Desktop)
// ==============================

function collapseSidebar(){

document.body.classList.toggle("sidebar-collapsed")

}


// ==============================
// Active Navigation Highlight
// ==============================

function setActiveNav(){

const path = window.location.pathname

document.querySelectorAll(".nav-item")
.forEach(link=>{

const href = link.getAttribute("href")

if(path.includes(href)){

link.classList.add("active")

}

})

}


// ==============================
// User Info
// ==============================

function loadUser(){

const user = JSON.parse(localStorage.getItem("user"))

if(user){

const userName = document.getElementById("userName")

if(userName){

userName.innerText = user.name

}

}

}


// ==============================
// Logout
// ==============================

function logout(){

localStorage.removeItem("token")
localStorage.removeItem("user")

window.location.href = "login.html"

}


// ==============================
// Page Animation
// ==============================

function animatePage(){

document.body.classList.add("animate-fade-in")

}


// ==============================
// Loader
// ==============================

function showLoader(){

let loader = document.getElementById("loader")

if(!loader){

loader = document.createElement("div")

loader.id = "loader"

loader.innerHTML = `
<div class="loader-spinner"></div>
`

document.body.appendChild(loader)

}

loader.style.display = "flex"

}

function hideLoader(){

const loader = document.getElementById("loader")

if(loader){

loader.style.display = "none"

}

}


// ==============================
// Chatbot Toggle
// ==============================

function toggleChat(){

const chat = document.getElementById("chatbox")

if(chat){

chat.classList.toggle("active")

}

}


// ==============================
// Chatbot Send
// ==============================

async function sendChat(event){

if(event.key !== "Enter") return

const input = document.getElementById("chatInput")
const message = input.value

if(!message) return

const body = document.getElementById("chatBody")

body.innerHTML += `
<div class="chat-message user">
${message}
</div>
`

input.value = ""

body.scrollTop = body.scrollHeight

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

body.innerHTML += `
<div class="chat-message ai">
${data.reply}
</div>
`

body.scrollTop = body.scrollHeight

}catch(error){

body.innerHTML += `
<div class="chat-message ai">
AI is currently unavailable
</div>
`

}

}


// ==============================
// Notification Toast
// ==============================

function showToast(message){

let toast = document.createElement("div")

toast.className = "toast"

toast.innerText = message

document.body.appendChild(toast)

setTimeout(()=>{

toast.remove()

},3000)

}


// ==============================
// Sidebar Hover Expand
// ==============================

function sidebarHover(){

const sidebar = document.querySelector(".sidebar")

if(!sidebar) return

sidebar.addEventListener("mouseenter",()=>{

if(document.body.classList.contains("sidebar-collapsed")){

sidebar.classList.add("hover-expand")

}

})

sidebar.addEventListener("mouseleave",()=>{

sidebar.classList.remove("hover-expand")

})

}


// ==============================
// Init Layout
// ==============================

document.addEventListener("DOMContentLoaded",()=>{

setActiveNav()
animatePage()
loadUser()
sidebarHover()

})