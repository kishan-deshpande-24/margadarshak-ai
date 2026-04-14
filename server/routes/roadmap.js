const express = require("express")

const router = express.Router()

const {
generateRoadmap,
getRoadmap,
updateProgress
} = require("../controllers/roadmapController")

// ==============================
// Generate Roadmap
// ==============================

router.post("/generate", generateRoadmap)


// ==============================
// Get Roadmap
// ==============================

router.get("/", getRoadmap)


// ==============================
// Update Progress
// ==============================

router.post("/progress", updateProgress)


module.exports = router