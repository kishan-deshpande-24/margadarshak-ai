const express = require("express")

const router = express.Router()

const {

getQuestions,
submitAssessment

} = require("../controllers/assessmentController")

router.get("/", getQuestions)

router.post("/submit", submitAssessment)

module.exports = router