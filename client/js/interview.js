let role = ""
let stage = "intro"
let answers = []

const qEl = document.getElementById("question")

async function startInterview(){

  role = document.getElementById("roleSelect").value

  document.getElementById("setupScreen").style.display="none"
  document.getElementById("interviewRoom").style.display="block"

  const stream = await navigator.mediaDevices.getUserMedia({ video:true })
  document.getElementById("camera").srcObject = stream

  const res = await fetch(`/api/interview/start?role=${role}`)
  const data = await res.json()

  stage = data.stage
  ask(data.question)
}

// ================= ASK =================
function ask(q){
  qEl.innerText = q
  speak(q, listen)
}

// ================= SPEAK =================
function speak(text, cb){
  const speech = new SpeechSynthesisUtterance(text)
  speech.onend = ()=> cb()
  speechSynthesis.speak(speech)
}

// ================= LISTEN =================
function listen(){

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition

  if(!SpeechRecognition){
    alert("Use Chrome browser")
    return
  }

  const rec = new SpeechRecognition()

  rec.lang = "en-US"
  rec.start()

  rec.onresult = async (e)=>{

    const answer = e.results[0][0].transcript

    console.log("User:", answer)

    if(answer.length < 10){
      speak("Please elaborate your answer")
      return
    }

    answers.push({ stage, answer })

    const res = await fetch("/api/interview/next",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ answer, role, stage })
    })

    const data = await res.json()

    stage = data.stage

    if(stage === "coding"){
      openCoding(data.nextQuestion)
      return
    }

    if(stage === "whiteboard"){
      openBoard(data.nextQuestion)
      return
    }

    speak(data.feedback, ()=>{
      ask(data.nextQuestion)
    })
  }

  rec.onerror = (e)=>{
    console.log("Mic error:", e.error)
  }
}

// ================= CODING =================
function openCoding(q){
  document.getElementById("interviewRoom").style.display="none"
  document.getElementById("codingRound").style.display="block"
  document.getElementById("codingQuestion").innerText = q
}

function runCode(){
  try{
    const res = eval(document.getElementById("codeEditor").value)
    document.getElementById("output").innerText = res
  }catch(e){
    document.getElementById("output").innerText = e.message
  }
}

function submitCode(){
  answers.push({ stage:"coding", answer:document.getElementById("codeEditor").value })
  document.getElementById("codingRound").style.display="none"
  document.getElementById("interviewRoom").style.display="block"
  ask("Explain your coding solution")
}

// ================= WHITEBOARD =================
let ctx = document.getElementById("board").getContext("2d")
let draw = false

document.getElementById("board").onmousedown=()=>draw=true
document.getElementById("board").onmouseup=()=>draw=false
document.getElementById("board").onmousemove=(e)=>{
  if(draw) ctx.fillRect(e.offsetX,e.offsetY,3,3)
}

function clearBoard(){
  ctx.clearRect(0,0,600,400)
}

function openBoard(q){
  document.getElementById("interviewRoom").style.display="none"
  document.getElementById("whiteboardRound").style.display="block"
  alert(q)
}

function continueInterview(){
  document.getElementById("whiteboardRound").style.display="none"
  document.getElementById("interviewRoom").style.display="block"
  ask("Explain your system design")
}

// ================= END =================
function endInterview(){
  finish()
}

// ================= FINISH =================
async function finish(){

  document.getElementById("interviewRoom").style.display="none"
  document.getElementById("resultScreen").style.display="block"

  const res = await fetch("/api/interview/submit",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ answers })
  })

  const data = await res.json()

  document.getElementById("score").innerText = "Score: "+data.score
  document.getElementById("feedback").innerText = data.feedback
}