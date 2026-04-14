console.log("Resume JS Loaded")

// Helper function to get userId from token
function getUserIdFromToken(){
try{
const token = localStorage.getItem("token")
if(!token){
console.error("No token found")
return null
}
const payload = token.split('.')[1]
const decoded = JSON.parse(atob(payload))
return decoded.userId
}catch(error){
console.error("Error decoding token", error)
return null
}
}

const userId = getUserIdFromToken()

async function analyzeResume(){

console.log("Analyze clicked")

const fileInput = document.getElementById("resumeFile")

if(!fileInput){

alert("File input not found")
return

}

if(fileInput.files.length === 0){

alert("Upload resume first")
return

}

const file = fileInput.files[0]

const reader = new FileReader()

reader.onload = async function(e){

const text = e.target.result

try{

const res = await fetch("/api/resume/analyze",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
text,
userId
})

})

const data = await res.json()

console.log(data)

document.getElementById("resumeScore").innerText =
data.score || 80

document.getElementById("atsScore").innerText =
data.ats || 75

document.getElementById("skillsList").innerHTML =
(data.skills || []).join(", ")

document.getElementById("suggestions").innerHTML =
(data.suggestions || []).join("<br>")

document.getElementById("feedback").innerHTML =
data.ai_feedback || "No feedback available"

// Reload previous analyses
loadPreviousAnalyses()

}catch(error){

console.log(error)
alert("Resume analysis failed")

}

}

reader.readAsText(file)

}

async function loadPreviousAnalyses(){

try{

const res = await fetch(`/api/resume?userId=${userId}`)

const data = await res.json()

console.log("Previous analyses:", data)

const container = document.getElementById("previousAnalyses")

if(!container){
// Create container if it doesn't exist
const mainContent = document.querySelector(".main-content")
const newContainer = document.createElement("div")
newContainer.id = "previousAnalyses"
newContainer.className = "glass-card"
newContainer.style.marginTop = "20px"
newContainer.innerHTML = `
<h3>Previous Resume Analyses</h3>
<div id="analysesList" style="margin-top:15px">
<p style="color:rgba(255,255,255,0.5)">No previous analyses yet.</p>
</div>
`
mainContent.appendChild(newContainer)
}

const analysesList = document.getElementById("analysesList")

if(!data.analyses || data.analyses.length === 0){
analysesList.innerHTML = `<p style="color:rgba(255,255,255,0.5)">No previous analyses yet.</p>`
return
}

analysesList.innerHTML = data.analyses.map(analysis => {
const date = new Date(analysis.created_at).toLocaleDateString()
const scoreColor = analysis.resume_score >= 80 ? "#3ecf8e" : analysis.resume_score >= 60 ? "#4facfe" : "#ff9800"

return `
<div style="padding:15px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:10px;border-left:4px solid ${scoreColor}">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
<h4 style="margin:0;color:#4facfe">Resume Analysis</h4>
<span style="font-size:24px;font-weight:bold;color:${scoreColor}">${analysis.resume_score}%</span>
</div>
<p style="margin:5px 0;color:rgba(255,255,255,0.6);font-size:13px">ATS Score: ${analysis.ats_score}% | Analyzed: ${date}</p>
<div style="margin-top:10px">
<span style="font-size:13px;color:rgba(255,255,255,0.5)">Skills:</span>
<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:5px">
${analysis.skills.map(skill => `<span style="background:rgba(79,172,254,0.2);padding:4px 10px;border-radius:12px;font-size:12px">${skill}</span>`).join("")}
</div>
</div>
<div style="margin-top:10px">
<span style="font-size:13px;color:rgba(255,255,255,0.5)">AI Feedback:</span>
<p style="margin-top:5px;color:rgba(255,255,255,0.7);font-size:13px">${analysis.ai_feedback || "No feedback available"}</p>
</div>
</div>
`
}).join("")

}catch(error){

console.error("Error loading previous analyses:", error)

}

}

// Load previous analyses on page load
document.addEventListener("DOMContentLoaded", () => {
loadPreviousAnalyses()
})