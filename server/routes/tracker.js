const express = require("express")

const router = express.Router()

const {

getTracker,
addCompany,
deleteCompany,
updateStatus

} = require("../controllers/trackerController.js")

router.get("/", getTracker)

router.post("/", addCompany)

router.delete("/:id", deleteCompany)

router.put("/:id", updateStatus)

module.exports = router