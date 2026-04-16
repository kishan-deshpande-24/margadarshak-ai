const express = require("express")
const router = express.Router()

const teamController = require("../controllers/teamController")

router.post("/create", teamController.createTeam)
router.post("/join-code", teamController.joinTeam)
router.get("/", teamController.getTeams)

router.get("/:teamId/members", teamController.getTeamMembers)
router.post("/:teamId/message", teamController.sendMessage)
router.get("/:teamId/messages", teamController.getMessages)

router.get("/:teamId/analytics", teamController.getTeamAnalytics)

module.exports = router