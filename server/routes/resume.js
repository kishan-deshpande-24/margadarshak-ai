const express = require("express")

const router = express.Router()

const {
analyzeResume,
getUserResumeAnalyses
} = require("../controllers/resumeController")

router.post("/analyze", analyzeResume)

router.get("/", getUserResumeAnalyses)

module.exports = router