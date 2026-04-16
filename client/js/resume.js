console.log("Resume JS Loaded")

const userId = "user123" // or decode token

let latestData = null

// ================= ANALYZE =================
window.analyzeResume = async function(){

const file = document.getElementById("resumeFile").files[0]

if(!file){
alert("Upload resume first")
return
}

const reader = new FileReader()

reader.onload = async function(){

const typedarray = new Uint8Array(this.result)

const pdf = await pdfjsLib.getDocument(typedarray).promise

let text = ""

for(let i=1;i<=pdf.numPages;i++){
const page = await pdf.getPage(i)
const content = await page.getTextContent()

content.items.forEach(item=>{
text += item.str + " "
})
}

// API
const res = await fetch("/api/resume/analyze",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ text, userId })
})

const data = await res.json()

latestData = data

// UI update
document.getElementById("resumeScore").innerText = data.score
document.getElementById("atsScore").innerText = data.ats
document.getElementById("skillsList").innerText = data.skills.join(", ")
document.getElementById("suggestions").innerHTML = data.suggestions.join("<br>")
document.getElementById("feedback").innerText = data.ai_feedback

loadPreviousAnalyses()
}

reader.readAsArrayBuffer(file)
}

// ================= DOWNLOAD PDF =================
window.downloadReport = function(){

if(!latestData){
alert("Analyze first")
return
}

const { jsPDF } = window.jspdf
const doc = new jsPDF()

doc.setFontSize(18)
doc.setTextColor(40,180,120)
doc.text("Resume Analysis Report", 20, 20)

doc.setTextColor(0,0,0)

doc.text(`Score: ${latestData.score}%`,20,40)
doc.text(`ATS Score: ${latestData.ats}%`,20,50)

doc.text("Skills:",20,70)
doc.text(latestData.skills.join(", "),20,80)

doc.text("Suggestions:",20,100)
doc.text(latestData.suggestions.join(", "),20,110)

doc.text("Feedback:",20,130)
doc.text(latestData.ai_feedback,20,140,{maxWidth:170})

doc.save("resume-report.pdf")
}

// ================= HISTORY =================
async function loadPreviousAnalyses(){

const res = await fetch(`/api/resume?userId=${userId}`)
const data = await res.json()

const container = document.getElementById("previousAnalyses")

if(!container) return

if(!data.analyses.length){
container.innerHTML = "No previous analyses"
return
}

container.innerHTML = data.analyses.map(a=>`
<div class="glass-card" style="margin-top:10px">
Score: ${a.resume_score}% | ATS: ${a.ats_score}%
</div>
`).join("")
}

document.addEventListener("DOMContentLoaded", loadPreviousAnalyses)