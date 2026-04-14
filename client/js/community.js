// ==============================
// Margadarshak AI Community
// ==============================

const API = "/api/community"

const postsContainer = document.getElementById("postsContainer")


// Load Posts
async function loadPosts(){

try{

const res = await fetch(API)

const posts = await res.json()

renderPosts(posts)

}catch(error){

console.error("Error loading posts",error)

}

}


// Render Posts

function renderPosts(posts){

postsContainer.innerHTML = ""

posts.forEach(post=>{

const postElement = document.createElement("div")

postElement.className = "glass-card post-card animate-fade-in"

postElement.innerHTML = `

<div class="post-header">

<div>

<strong>${post.user}</strong>
<p>${new Date(post.createdAt).toLocaleString()}</p>

</div>

</div>

<p class="post-content">

${post.content}

</p>

<div class="post-actions">

<button onclick="likePost(${post.id})">
👍 ${post.likes}
</button>

<button onclick="showCommentBox(${post.id})">
💬 Comment
</button>

</div>

<div id="comments-${post.id}" class="comments">

${renderComments(post.comments)}

</div>

<div id="comment-box-${post.id}" class="comment-box"></div>

`

postsContainer.appendChild(postElement)

})

}


// Render Comments

function renderComments(comments){

if(!comments) return ""

return comments.map(c=>`

<div class="comment">

<strong>${c.user}</strong>

<p>${c.comment}</p>

</div>

`).join("")

}


// Create Post

async function createPost(){

const content = document.getElementById("postInput").value

const user = localStorage.getItem("user") || "User"

if(!content) return

try{

await fetch(API,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

user,
content

})

})

document.getElementById("postInput").value=""

loadPosts()

}catch(error){

console.error("Error creating post",error)

}

}


// Like Post

async function likePost(id){

try{

await fetch(`${API}/like/${id}`,{

method:"POST"

})

loadPosts()

}catch(error){

console.error("Like error",error)

}

}


// Show Comment Box

function showCommentBox(id){

const box = document.getElementById(`comment-box-${id}`)

box.innerHTML = `

<input 
type="text" 
id="comment-input-${id}"
placeholder="Write comment..."
>

<button onclick="submitComment(${id})">
Send
</button>

`

}


// Submit Comment

async function submitComment(id){

const comment = document.getElementById(`comment-input-${id}`).value

const user = localStorage.getItem("user") || "User"

if(!comment) return

try{

await fetch(`${API}/comment/${id}`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

user,
comment

})

})

loadPosts()

}catch(error){

console.error("Comment error",error)

}

}


// Load On Start

document.addEventListener("DOMContentLoaded",()=>{

loadPosts()

})