console.log("Resume JS Loaded")

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
text
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

}catch(error){

console.log(error)
alert("Resume analysis failed")

}

}

reader.readAsText(file)

}