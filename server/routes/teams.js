const express = require("express")

const router = express.Router()

const {
createTeam,
getTeams,
joinTeam,
leaveTeam,
getMembers
} = require("../controllers/teamController")

// ==============================
// Create Team
// ==============================

router.post("/", createTeam)


// ==============================
// Get Teams
// ==============================

router.get("/", getTeams)


// ==============================
// Join Team
// ==============================

router.post("/join", joinTeam)


// ==============================
// Leave Team
// ==============================

router.post("/leave", leaveTeam)


// ==============================
// Get Team Members
// ==============================

router.get("/members", getMembers)


module.exports = router