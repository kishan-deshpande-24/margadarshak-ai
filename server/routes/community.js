const express = require("express")

const router = express.Router()

const {
getPosts,
createPost,
likePost,
commentPost,
deletePost
} = require("../controllers/communityController")

// ==============================
// Get Posts
// ==============================

router.get("/", getPosts)


// ==============================
// Create Post
// ==============================

router.post("/", createPost)


// ==============================
// Like Post
// ==============================

router.post("/like/:id", likePost)


// ==============================
// Comment Post
// ==============================

router.post("/comment/:id", commentPost)


// ==============================
// Delete Post
// ==============================

router.delete("/:id", deletePost)


module.exports = router