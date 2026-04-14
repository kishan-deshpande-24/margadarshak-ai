// ==============================
// Margadarshak AI Roadmap
// ==============================

const token = localStorage.getItem("token")

// Helper function to decode JWT and get userId
function getUserIdFromToken(){
try{
const payload = token.split('.')[1]
const decoded = JSON.parse(atob(payload))
return decoded.userId
}catch(error){
console.error("Error decoding token", error)
return null
}
}

const userId = getUserIdFromToken()


// ==============================
// Load Roadmap on Page Load
// ==============================

async function loadSavedRoadmap(){

const savedRoadmap = localStorage.getItem("savedRoadmap")

if(savedRoadmap){

try{

const data = JSON.parse(savedRoadmap)

displayRoadmap(data)

}catch(error){

console.error("Error loading saved roadmap",error)

}

}else{

// Try to load roadmap from database
try{

showLoader()

const res = await fetch(`/api/roadmap?userId=${userId}`)

const data = await res.json()

hideLoader()

if(data && data.roadmap){

displayRoadmap(data)

localStorage.setItem("savedRoadmap", JSON.stringify(data))

}

}catch(error){

console.error("Error loading roadmap from database",error)

hideLoader()

}

}

}


// ==============================
// Generate Roadmap
// ==============================

async function generateRoadmap(){

const skill = document.getElementById("skillInput").value

if(!skill){

showToast("Please enter a skill")
return

}

// Check if there's an existing roadmap
const existingRoadmap = localStorage.getItem("savedRoadmap")

if(existingRoadmap){

// Ask for confirmation
const confirmed = confirm("Generating a new roadmap will reset your current progress. Do you want to continue?")

if(!confirmed){

return

}

// Reset progress
localStorage.removeItem("completedSkills")
localStorage.removeItem("completedSteps")
localStorage.removeItem("roadmapProgress")

}

try{

showLoader()

const res = await fetch("/api/roadmap/generate",{

method:"POST",

headers:{
"Content-Type":"application/json",
Authorization: token
},

body:JSON.stringify({
career: skill,
userId: userId
})

})

const data = await res.json()

hideLoader()

displayRoadmap(data)

localStorage.setItem("savedRoadmap", JSON.stringify(data))

}catch(error){

console.error("Roadmap error",error)

hideLoader()

showToast("Error generating roadmap")

}

}


// ==============================
// Display Roadmap
// ==============================

function displayRoadmap(data){

// Update career info
if(data.career){

document.getElementById("careerTitle").innerText = data.career.title || data.career || "Career Roadmap"
document.getElementById("careerDescription").innerText = data.career.description || "Your personalized learning roadmap"

}

// Show progress section if roadmap exists
const progressSection = document.getElementById("progressSection")
if(data.roadmap && data.roadmap.length > 0){
progressSection.style.display = "block"
}else{
progressSection.style.display = "none"
}

// Display roadmap steps
const container =
document.getElementById("roadmapSteps")

container.innerHTML=""

if(data.roadmap && data.roadmap.length > 0){

data.roadmap.forEach((step,index)=>{

const card = document.createElement("div")

card.className="glass-card roadmap-card animate-fade-in"

card.innerHTML=`

<h3>Step ${index+1}${step.duration ? ` - ${step.duration}` : ''}</h3>

<h4 style="cursor:pointer;${isStepCompleted(index) ? 'text-decoration:line-through;opacity:0.6' : ''}" onclick="toggleStep(${index})">${step.title}</h4>

<p>${step.description}</p>

<div class="step-skills" style="margin-top:15px">
<h5>Skills in this step:</h5>
${step.skills && step.skills.map((skill, skillIndex)=>
`<div class="skill-item" style="margin:8px 0;padding:8px;background:rgba(255,255,255,0.05);border-radius:6px;cursor:pointer;${isSkillCompleted(skill) ? 'text-decoration:line-through;opacity:0.6' : ''}" onclick="toggleSkill('${skill}')">
${skill}
</div>`
).join("") || ""}
</div>

${step.resources && step.resources.length > 0 ? `
<div class="step-resources" style="margin-top:15px">
<h5>Resources:</h5>
${step.resources.map(resource=>
`<div style="margin:5px 0;padding:8px;background:rgba(79,172,254,0.1);border-radius:6px;font-size:13px">${resource}</div>`
).join("")}
</div>
` : ""}

`

container.appendChild(card)

})

}

// Display skills with clickable text
if(data.skills){

const skillsList = document.getElementById("skillsList")

skillsList.innerHTML = data.skills.map((skill, index)=>
`<div class="skill-item" style="margin:8px 0;padding:12px;background:rgba(255,255,255,0.05);border-radius:6px;cursor:pointer;${isSkillCompleted(skill) ? 'text-decoration:line-through;opacity:0.6' : ''}" onclick="toggleSkill('${skill}')">
${skill}
</div>`
).join("")

}

// Display projects with additional details
if(data.projects){

const projectsList = document.getElementById("projectsList")

projectsList.innerHTML = data.projects.map(project=>
`<div class="project-item" style="padding:15px;background:rgba(255,255,255,0.05);border-radius:8px;margin:10px 0">
<h4 style="margin:0 0 8px 0;color:#4facfe">${project.name}${project.difficulty ? ` <span style="font-size:12px;background:rgba(79,172,254,0.2);padding:2px 8px;border-radius:4px;margin-left:8px">${project.difficulty}</span>` : ''}</h4>
<p style="margin:0 0 8px 0;color:rgba(255,255,255,0.7)">${project.description}</p>
${project.technologies && project.technologies.length > 0 ? `
<div style="margin-top:8px">
<span style="font-size:13px;color:rgba(255,255,255,0.5)">Technologies:</span>
<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:5px">
${project.technologies.map(tech=>
`<span style="font-size:12px;background:rgba(255,255,255,0.1);padding:3px 8px;border-radius:4px">${tech}</span>`
).join("")}
</div>
</div>
` : ""}
</div>`
).join("")

}

// Save completed skills to localStorage
if(!localStorage.getItem("completedSkills")){
localStorage.setItem("completedSkills", JSON.stringify([]))
}

// Save completed steps to localStorage
if(!localStorage.getItem("completedSteps")){
localStorage.setItem("completedSteps", JSON.stringify([]))
}

// Update progress
updateProgress()

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

const savedRoadmap = localStorage.getItem("savedRoadmap")

if(!savedRoadmap) return

const data = JSON.parse(savedRoadmap)

const completedSkills = JSON.parse(localStorage.getItem("completedSkills") || "[]")

const totalSkills = data.skills ? data.skills.length : 0

const completedCount = completedSkills.length

const progress = totalSkills > 0 ? Math.round((completedCount/totalSkills)*100) : 0

const progressBar = document.getElementById("progressBar")
const progressText = document.getElementById("progressText")

if(progressBar) progressBar.style.width = progress + "%"
if(progressText) progressText.innerText = progress + "%"

// Save progress to localStorage for dashboard
localStorage.setItem("roadmapProgress", progress)

console.log("Progress updated:", progress + "%", "Completed skills:", completedCount, "Total skills:", totalSkills)

}


// ==============================
// Download PDF
// ==============================

async function downloadRoadmap(){

try{

// Get roadmap from localStorage
const savedRoadmap = localStorage.getItem("savedRoadmap")

if(!savedRoadmap){

showToast("No roadmap to download")
return

}

const data = JSON.parse(savedRoadmap)

// Generate HTML for PDF
const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Roadmap - ${data.career}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            text-align: center;
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .section {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { margin: 0; }
        h2 { color: #4facfe; margin-top: 0; }
        .step {
            margin-bottom: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
            border-left: 4px solid #4facfe;
        }
        .skill {
            display: inline-block;
            background: #e3f2fd;
            color: #1976d2;
            padding: 5px 10px;
            border-radius: 15px;
            margin: 5px;
            font-size: 14px;
        }
        .project {
            margin-bottom: 15px;
            padding: 15px;
            background: #fff3e0;
            border-radius: 8px;
            border-left: 4px solid #ff9800;
        }
        .difficulty {
            display: inline-block;
            background: #ff9800;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 10px;
        }
        .resource {
            background: #e8f5e9;
            color: #2e7d32;
            padding: 8px;
            border-radius: 4px;
            margin: 5px 0;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Roadmap: ${data.career.title || data.career}</h1>
        <p>Generated by Margadarshak AI</p>
    </div>

    <div class="section">
        <h2>Description</h2>
        <p>${data.career.description || "Your personalized learning path"}</p>
    </div>

    <div class="section">
        <h2>Learning Steps</h2>
        ${data.roadmap ? data.roadmap.map((step, index) => `
            <div class="step">
                <h3>Step ${index + 1}: ${step.title}</h3>
                <p>${step.description}</p>
                ${step.duration ? `<p><strong>Duration:</strong> ${step.duration}</p>` : ''}
                <div>
                    <strong>Skills:</strong><br>
                    ${step.skills ? step.skills.map(skill => `<span class="skill">${skill}</span>`).join('') : ''}
                </div>
                ${step.resources ? `
                    <div style="margin-top:10px">
                        <strong>Resources:</strong><br>
                        ${step.resources.map(resource => `<div class="resource">${resource}</div>`).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('') : ''}
    </div>

    <div class="section">
        <h2>All Skills</h2>
        ${data.skills ? data.skills.map(skill => `<span class="skill">${skill}</span>`).join('') : ''}
    </div>

    <div class="section">
        <h2>Recommended Projects</h2>
        ${data.projects ? data.projects.map(project => `
            <div class="project">
                <h4>${project.name}${project.difficulty ? `<span class="difficulty">${project.difficulty}</span>` : ''}</h4>
                <p>${project.description}</p>
                ${project.technologies ? `
                    <div>
                        <strong>Technologies:</strong>
                        ${project.technologies.map(tech => `<span class="skill">${tech}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('') : ''}
    </div>

    <div style="text-align:center;color:#666;font-size:12px;margin-top:20px">
        Generated by Margadarshak AI - Your AI Career Guide
    </div>
</body>
</html>
`

// Create a new window with the HTML for printing
const printWindow = window.open('', '_blank')
printWindow.document.write(html)
printWindow.document.close()

// Trigger print dialog
setTimeout(() => {
printWindow.print()
}, 500)

}catch(error){

console.error("Download error:", error)
showToast("Error downloading roadmap")

}

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


// ==============================
// Skill Completion Tracking
// ==============================

function isSkillCompleted(skill){

const completedSkills = JSON.parse(localStorage.getItem("completedSkills") || "[]")
return completedSkills.includes(skill)

}

function toggleSkill(skill){

const completedSkills = JSON.parse(localStorage.getItem("completedSkills") || "[]")

if(completedSkills.includes(skill)){

const index = completedSkills.indexOf(skill)

if(index > -1){

completedSkills.splice(index, 1)

}

}else{

completedSkills.push(skill)

}

localStorage.setItem("completedSkills", JSON.stringify(completedSkills))

// Update progress and save to localStorage for dashboard
updateProgress()

// Re-render to update strikethrough
const savedRoadmap = localStorage.getItem("savedRoadmap")

if(savedRoadmap){

const data = JSON.parse(savedRoadmap)

displayRoadmap(data)

}

}

// ==============================
// Step Completion Tracking
// ==============================

function isStepCompleted(stepIndex){

const completedSteps = JSON.parse(localStorage.getItem("completedSteps") || "[]")
return completedSteps.includes(stepIndex)

}

function toggleStep(stepIndex){

const completedSteps = JSON.parse(localStorage.getItem("completedSteps") || "[]")

if(completedSteps.includes(stepIndex)){

const index = completedSteps.indexOf(stepIndex)

if(index > -1){

completedSteps.splice(index, 1)

}

}else{

completedSteps.push(stepIndex)

}

localStorage.setItem("completedSteps", JSON.stringify(completedSteps))

// Update progress and save to localStorage for dashboard
updateProgress()

// Re-render to update strikethrough
const savedRoadmap = localStorage.getItem("savedRoadmap")

if(savedRoadmap){

const data = JSON.parse(savedRoadmap)

displayRoadmap(data)

}

}