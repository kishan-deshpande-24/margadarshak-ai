
const express = require("express")
const router = express.Router()

const controller = require("../controllers/interviewController")

router.get("/start", controller.startInterview)
router.post("/next", controller.nextQuestion)
router.post("/submit", controller.submitInterview)

module.exports = router