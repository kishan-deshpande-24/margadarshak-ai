const express = require("express")

const router = express.Router()

const {
signup,
login,
verify
} = require("../controllers/authController")

// ==============================
// Signup
// ==============================

router.post("/signup", signup)


// ==============================
// Login
// ==============================

router.post("/login", login)


// ==============================
// Verify Token
// ==============================

router.get("/verify", verify)


module.exports = router