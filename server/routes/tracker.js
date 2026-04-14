const express = require("express")

const router = express.Router()

const {

getTracker,
addCompany,
deleteCompany

} = require("../controllers/trackerCOntroller.js")

router.get("/", getTracker)

router.post("/", addCompany)

router.delete("/:id", deleteCompany)

module.exports = router