const express = require("express")

const router = express.Router()

const mentor = require("../controllers/mentorController")

router.post("/", mentor.chatMentor)

router.post("/interview", mentor.mockInterview)

router.get("/challenge", mentor.dailyChallenge)

router.get("/progress", mentor.getProgress)

module.exports = router