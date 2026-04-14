require("dotenv").config()

const express = require("express")
const cors = require("cors")
const path = require("path")

// Routes

const authRoutes = require("./routes/auth")
const dashboardRoutes = require("./routes/dashboard")
const assessmentRoutes = require("./routes/assessment")
const interviewRoutes = require("./routes/interview")
const mentorRoutes = require("./routes/mentor")
const teamsRoutes = require("./routes/teams")
const communityRoutes = require("./routes/community")
const profileRoutes = require("./routes/profile")
const roadmapRoutes = require("./routes/roadmap")
const resumeRoutes = require("./routes/resume")
const trackerRoutes = require("./routes/tracker")

const app = express()

// ==============================
// Middleware
// ==============================

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// ==============================
// API Routes
// ==============================

app.use("/api/auth", authRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/assessment", assessmentRoutes)
app.use("/api/interview", interviewRoutes)
app.use("/api/mentor", mentorRoutes)
app.use("/api/teams", teamsRoutes)
app.use("/api/community", communityRoutes)
app.use("/api/profile", profileRoutes)
app.use("/api/roadmap", roadmapRoutes)
app.use("/api/resume", resumeRoutes)
app.use("/api/tracker", trackerRoutes)


// ==============================
// Serve Frontend
// ==============================

app.use(express.static(path.join(__dirname, "../client")))


// ==============================
// SPA Fallback
// ==============================

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"))
})


// ==============================
// Start Server
// ==============================

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})