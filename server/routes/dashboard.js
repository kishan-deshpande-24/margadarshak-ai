const express = require("express")

const router = express.Router()

const {
getDashboard
} = require("../controllers/dashboardController")

// ==============================
// Get Dashboard Data
// ==============================

router.get("/", getDashboard)

module.exports = router