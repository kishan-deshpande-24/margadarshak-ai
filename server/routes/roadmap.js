const express = require("express")

const router = express.Router()

const {
generateRoadmap,
getRoadmap,
updateProgress,
downloadRoadmap
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


// ==============================
// Download Roadmap
// ==============================

router.get("/download", downloadRoadmap)


module.exports = router