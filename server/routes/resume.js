const express = require("express")

const router = express.Router()

const {
analyzeResume
} = require("../controllers/resumeController")

router.post("/analyze", analyzeResume)

module.exports = router