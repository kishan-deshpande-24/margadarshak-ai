async function loadTracker(){

const res = await fetch("/api/tracker")

const data = await res.json()

const container = document.getElementById("trackerContainer")

container.innerHTML=""

data.forEach(item=>{

const div = document.createElement("div")

div.className="glass-card animate-fade-in"

div.innerHTML=`

<h3>${item.company}</h3>
<p>${item.role}</p>
<p>${item.status}</p>

<button onclick="deleteCompany('${item.id}')"
class="btn btn-danger">
Delete
</button>

`

container.appendChild(div)

})

}



async function addCompany(){

const company = document.getElementById("company").value
const role = document.getElementById("role").value
const status = document.getElementById("status").value

await fetch("/api/tracker",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
company,
role,
status
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