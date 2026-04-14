const express = require("express")

const router = express.Router()

const {
getProfile,
updateProfile,
getProfileStats
} = require("../controllers/profileController")

// ==============================
// Get Profile
// ==============================

router.get("/", getProfile)


// ==============================
// Update Profile
// ==============================

router.post("/update", updateProfile)


// ==============================
// Get Profile Stats
// ==============================

router.get("/stats", getProfileStats)


module.exports = router