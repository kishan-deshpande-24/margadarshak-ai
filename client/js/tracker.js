const token = localStorage.getItem("token")

// Helper function to decode JWT and get userId
function getUserIdFromToken(){
try{
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

async function loadTracker(){

console.log("loadTracker called with userId:", userId)

const res = await fetch(`/api/tracker?userId=${userId}`)

const data = await res.json()

console.log("loadTracker response:", data)

const container = document.getElementById("trackerContainer")

container.innerHTML=""

if(!data || data.length === 0){
container.innerHTML = "<p style='color:rgba(255,255,255,0.5)'>No job applications yet. Add your first application!</p>"
return
}

data.forEach(item=>{

const div = document.createElement("div")

div.className="glass-card animate-fade-in"

const statusColor = item.status === "Offer" ? "#3ecf8e" : item.status === "Interview" ? "#4facfe" : item.status === "Rejected" ? "#ff9800" : "rgba(255,255,255,0.7)"

div.innerHTML=`

<h3>${item.company}</h3>
<p style="color:rgba(255,255,255,0.6)">${item.role}</p>
<p style="color:${statusColor};font-weight:bold">${item.status}</p>

<select onchange="updateStatus('${item.id}', this.value)" style="margin-top:10px;padding:8px;border-radius:5px;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2)">
<option value="Applied" ${item.status === "Applied" ? "selected" : ""}>Applied</option>
<option value="Interview" ${item.status === "Interview" ? "selected" : ""}>Interview</option>
<option value="Rejected" ${item.status === "Rejected" ? "selected" : ""}>Rejected</option>
<option value="Offer" ${item.status === "Offer" ? "selected" : ""}>Offer</option>
</select>

<button onclick="deleteCompany('${item.id}')"
class="btn btn-danger" style="margin-top:10px">
Delete
</button>

`

container.appendChild(div)

})

}



async function addCompany(){

console.log("addCompany called")
console.log("userId:", userId)

const company = document.getElementById("company").value
const role = document.getElementById("role").value
const status = document.getElementById("status").value

console.log("Form values:", {company, role, status})

if(!userId){
alert("Please login first.")
return
}

if(!company || !role){
alert("Please fill in company and role fields.")
return
}

try{
const res = await fetch("/api/tracker",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
company,
role,
status,
userId
})

})

const data = await res.json()
console.log("Add company response:", data)

// Clear form
document.getElementById("company").value = ""
document.getElementById("role").value = ""
document.getElementById("status").value = "Applied"

// Hide form
document.getElementById("addForm").style.display = "none"

loadTracker()

}catch(error){
console.error("Error adding company:", error)
alert("Error adding company. Please try again.")
}

}

async function updateStatus(id, newStatus){

await fetch(`/api/tracker/${id}`,{

method:"PUT",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
status: newStatus
})

})

loadTracker()

}



async function deleteCompany(id){

await fetch("/api/tracker/"+id,{

method:"DELETE"

})

loadTracker()

}

loadTracker()