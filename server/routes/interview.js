const express = require("express")

const router = express.Router()

const {
getQuestions,
submitInterview,
getReport
} = require("../controllers/interviewController")

// ==============================
// Get Interview Questions
// ==============================

router.get("/question", getQuestions)


// ==============================
// Submit Interview
// ==============================

router.post("/submit", submitInterview)


// ==============================
// Get Interview Report
// ==============================

router.get("/report", getReport)


module.exports = router