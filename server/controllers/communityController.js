const supabase = require("../services/supabase")

// Get Posts
exports.getPosts = async (req, res) => {

try {

const { data, error } = await supabase
.from("community")
.select("*")
.order("created_at", { ascending: false })

if(error) throw error

res.json(data)

} catch (error) {

console.log(error)
res.json([])

}

}


// Create Post
exports.createPost = async (req, res) => {

try {

const { content } = req.body

const { data, error } = await supabase
.from("community")
.insert([{ content }])
.select()

if(error) throw error

res.json(data)

} catch (error) {

console.log(error)
res.json({})

}

}


// Like Post
exports.likePost = async (req, res) => {

try {

const { id } = req.params

const { data } = await supabase
.from("community")
.select("likes")
.eq("id", id)
.single()

await supabase
.from("community")
.update({
likes: (data.likes || 0) + 1
})
.eq("id", id)

res.json({ success: true })

} catch (error) {

console.log(error)
res.json({})

}

}


// Comment
exports.commentPost = async (req, res) => {

try {

const { id } = req.params
const { comment } = req.body

const { data } = await supabase
.from("community")
.select("comments")
.eq("id", id)
.single()

const comments = data.comments || []

comments.push(comment)

await supabase
.from("community")
.update({ comments })
.eq("id", id)

res.json({ success: true })

} catch (error) {

console.log(error)
res.json({})

}

}


// Delete
exports.deletePost = async (req, res) => {

try {

const { id } = req.params

await supabase
.from("community")
.delete()
.eq("id", id)

res.json({ success: true })

} catch (error) {

console.log(error)
res.json({})

}

}
