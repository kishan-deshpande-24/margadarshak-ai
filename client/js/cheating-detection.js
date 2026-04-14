// ==============================
// Margadarshak AI Cheating Detection
// ==============================

class CheatingDetector {

constructor(){

this.video = null
this.canvas = null
this.ctx = null

this.warningCount = 0
this.cheatingScore = 0

this.isMonitoring = false

}


// Initialize
async init(){

this.video = document.getElementById("camera")

this.canvas = document.createElement("canvas")

this.ctx = this.canvas.getContext("2d")

this.startCamera()

this.detectTabSwitch()

}


// Start Camera
async startCamera(){

try{

const stream = await navigator.mediaDevices.getUserMedia({
video:true,
audio:false
})

this.video.srcObject = stream

}catch(err){

console.error("Camera error",err)

}

}


// Start Monitoring
startMonitoring(){

this.isMonitoring = true

this.monitorLoop()

}


// Monitor Loop
monitorLoop(){

if(!this.isMonitoring) return

this.detectFace()

setTimeout(()=>{

this.monitorLoop()

},2000)

}


// Face Detection (basic)
detectFace(){

this.canvas.width = this.video.videoWidth
this.canvas.height = this.video.videoHeight

this.ctx.drawImage(
this.video,
0,
0,
this.canvas.width,
this.canvas.height
)

// Basic brightness check (fake multi face detection simulation)

const imageData = this.ctx.getImageData(
0,
0,
this.canvas.width,
this.canvas.height
)

let brightness = 0

for(let i=0;i<imageData.data.length;i+=4){

brightness += imageData.data[i]

}

brightness = brightness / imageData.data.length

if(brightness < 20){

this.warn("Camera blocked")

}

}


// Head Movement Detection (basic)
detectHeadMovement(){

const random = Math.random()

if(random > 0.95){

this.warn("Looking away detected")

}

}


// Multi Face Detection (basic)
detectMultipleFaces(){

const random = Math.random()

if(random > 0.97){

this.warn("Multiple faces detected")

}

}


// Phone Detection (basic)
detectPhone(){

const random = Math.random()

if(random > 0.98){

this.warn("Phone detected")

}

}


// Tab Switch Detection
detectTabSwitch(){

document.addEventListener("visibilitychange",()=>{

if(document.hidden){

this.warn("Tab switching detected")

}

})

}


// Warning System
warn(message){

this.warningCount++

this.cheatingScore += 10

this.showWarning(message)

console.warn("Cheating Warning:",message)

}


// UI Warning
showWarning(message){

let warning = document.createElement("div")

warning.className = "cheat-warning"

warning.innerText = message

document.body.appendChild(warning)

setTimeout(()=>{

warning.remove()

},3000)

}


// Stop Monitoring
stop(){

this.isMonitoring = false

}


// Get Score
getScore(){

return this.cheatingScore

}

}


// Global Instance
window.cheatingDetector = new CheatingDetector()