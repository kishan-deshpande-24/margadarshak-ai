const express = require("express")

const router = express.Router()

const {

getQuestions,
submitAssessment,
generateAssessment,
saveAssessment,
getUserAssessments

} = require("../controllers/assessmentController")

router.get("/", getQuestions)

router.post("/submit", submitAssessment)

router.post("/generate", generateAssessment)

router.post("/save", saveAssessment)

router.get("/user", getUserAssessments)

module.exports = router