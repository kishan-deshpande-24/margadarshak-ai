let currentTeam = null

function getUserId(){
  return localStorage.getItem("userId") || "user123"
}

// LOAD TEAMS
async function loadTeams(){
  const res = await fetch("/api/teams")
  const data = await res.json()

  const container = document.getElementById("teamsList")

  container.innerHTML = data.teams.map(team => `
    <div class="glass-card" style="display:flex;align-items:center;gap:10px">
      <img src="${team.avatar}" width="40" style="border-radius:50%">
      <div style="flex:1">
        <b>${team.name}</b><br>
        Code: ${team.invite_code}
      </div>
      <button onclick="selectTeam('${team.id}')">Open</button>
    </div>
  `).join("")
}

// CREATE TEAM
async function createTeam(){
  const name = document.getElementById("teamName").value

  await fetch("/api/teams/create",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      name,
      userId:getUserId()
    })
  })

  loadTeams()
}

// JOIN TEAM
async function joinTeam(){
  const code = document.getElementById("inviteCode").value

  await fetch("/api/teams/join-code",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      code,
      userId:getUserId()
    })
  })

  alert("Joined team")
  loadTeams()
}

// SELECT TEAM
function selectTeam(id){
  currentTeam = id
  loadMessages()
  loadAnalytics()
}

// SEND MESSAGE
async function sendMessage(){
  const text = document.getElementById("messageInput").value

  await fetch(`/api/teams/${currentTeam}/message`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      userId:getUserId(),
      text
    })
  })

  document.getElementById("messageInput").value=""
  loadMessages()
}

// LOAD MESSAGES
async function loadMessages(){
  const res = await fetch(`/api/teams/${currentTeam}/messages`)
  const data = await res.json()

  document.getElementById("chatBox").innerHTML =
    data.messages.map(m=>`<div>${m.user_id}: ${m.text}</div>`).join("")
}

// ANALYTICS
async function loadAnalytics(){
  const res = await fetch(`/api/teams/${currentTeam}/analytics`)
  const data = await res.json()

  document.getElementById("analytics").innerHTML = `
    Members: ${data.totalMembers}<br>
    Messages: ${data.totalMessages}
  `
}

loadTeams()