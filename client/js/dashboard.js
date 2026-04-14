// ==============================
// Margadarshak AI Dashboard
// ==============================

const token = localStorage.getItem("token")

let skillProgressChart
let roadmapProgressChart


// Load Dashboard

async function loadDashboard() {

    try {

        showLoader()

        const res = await fetch("/api/dashboard", {

            headers: {
                Authorization: token
            }

        })

        const data = await res.json()

        hideLoader()

        loadUser()

    } catch (error) {

        console.error("Dashboard error", error)

        hideLoader()

    }

    // Load roadmap progress after everything else loads
    setTimeout(() => {
        loadRoadmapProgress()
    }, 100)

    // Load assessments
    loadAssessments()

    // Load job applications
    loadJobApplications()

    // Load resume analysis
    loadResumeAnalysis()

}


// Load Roadmap Progress

function loadRoadmapProgress() {

    const roadmapProgress = localStorage.getItem("roadmapProgress") || "0"
    const roadmapProgressElement = document.getElementById("roadmapProgress")
    if (roadmapProgressElement) {
        roadmapProgressElement.innerText = roadmapProgress + "%"
    }

    // Create roadmap progress bar chart
    const roadmapProgressCtx = document.getElementById("roadmapProgressChart")
    if (roadmapProgressCtx) {
        if (roadmapProgressChart) roadmapProgressChart.destroy()

        const progressValue = parseInt(roadmapProgress) || 0

        roadmapProgressChart = new Chart(roadmapProgressCtx, {
            type: "bar",
            data: {
                labels: ["Progress"],
                datasets: [{
                    data: [progressValue],
                    backgroundColor: progressValue === 100 ? "#3ecf8e" : "#4facfe",
                    borderRadius: 10,
                    barThickness: 20
                }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        display: false,
                        max: 100
                    },
                    y: {
                        display: false
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function (context) {
                                return `Progress: ${context.raw}%`
                            }
                        }
                    }
                }
            }
        })
    }

    // Load roadmap skills completion
    const completedSkills = JSON.parse(localStorage.getItem("completedSkills") || "[]")
    const savedRoadmap = localStorage.getItem("savedRoadmap")

    console.log("Dashboard loading roadmap progress:", roadmapProgress, "Completed skills:", completedSkills.length, "Saved roadmap:", !!savedRoadmap)

    if (savedRoadmap) {
        const roadmapData = JSON.parse(savedRoadmap)
        const totalRoadmapSkills = roadmapData.skills ? roadmapData.skills.length : 0

        // Update skills completed to show roadmap progress
        const skillsCompletedElement = document.getElementById("skillsCompleted")
        if (skillsCompletedElement && totalRoadmapSkills > 0) {
            skillsCompletedElement.innerText = `${completedSkills.length}/${totalRoadmapSkills}`
            console.log("Updated skills completed:", `${completedSkills.length}/${totalRoadmapSkills}`)
        }

        // Create skill progress chart
        const skillProgressCtx = document.getElementById("skillProgressChart")
        if (skillProgressCtx && totalRoadmapSkills > 0) {
            if (skillProgressChart) skillProgressChart.destroy()

            skillProgressChart = new Chart(skillProgressCtx, {
                type: "doughnut",
                data: {
                    labels: ["Completed", "Remaining"],
                    datasets: [{
                        data: [completedSkills.length, totalRoadmapSkills - completedSkills.length],
                        backgroundColor: [
                            "#4facfe",
                            "#1f2937"
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return `${context.label}: ${context.raw}`
                                }
                            }
                        }
                    },
                    cutout: "70%"
                }
            })
        }
    }

}

// Load Assessments

async function loadAssessments() {

    try {

        const token = localStorage.getItem("token")

        // Get userId from token
        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload))
        const userId = decoded.userId

        const res = await fetch(`/api/assessment/user?userId=${userId}`, {
            headers: {
                Authorization: token
            }
        })

        const data = await res.json()

        const assessmentsList = document.getElementById("assessmentsList")

        if (!data.assessments || data.assessments.length === 0) {
            // Fallback: Try loading from localStorage
            const savedAssessments = JSON.parse(localStorage.getItem("savedAssessments") || "[]")
            if (savedAssessments.length > 0) {
                assessmentsList.innerHTML = savedAssessments.map(assessment => {
                    const date = new Date(assessment.completedAt).toLocaleDateString()
                    const scoreColor = assessment.score >= 80 ? "#3ecf8e" : assessment.score >= 60 ? "#4facfe" : "#ff9800"

                    return `
                        <div class="assessment-item" style="padding:15px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:10px;border-left:4px solid ${scoreColor}">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                                <h4 style="margin:0;color:#4facfe">${assessment.career}</h4>
                                <span style="font-size:24px;font-weight:bold;color:${scoreColor}">${assessment.score}%</span>
                            </div>
                            <p style="margin:5px 0;color:rgba(255,255,255,0.6);font-size:13px">Completed: ${date}</p>
                            <div style="margin-top:10px">
                                <span style="font-size:13px;color:rgba(255,255,255,0.5)">Tech Stack:</span>
                                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:5px">
                                    ${assessment.techStack.map(tech => `<span style="background:rgba(79,172,254,0.2);padding:4px 10px;border-radius:12px;font-size:12px">${tech}</span>`).join("")}
                                </div>
                            </div>
                        </div>
                    `
                }).join("")
            } else {
                assessmentsList.innerHTML = `<p style="color:rgba(255,255,255,0.5)">No assessments completed yet.</p>`
            }
            return
        }

        assessmentsList.innerHTML = data.assessments.map(assessment => {
            const date = new Date(assessment.completed_at).toLocaleDateString()
            const scoreColor = assessment.score >= 80 ? "#3ecf8e" : assessment.score >= 60 ? "#4facfe" : "#ff9800"

            return `
                <div class="assessment-item" style="padding:15px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:10px;border-left:4px solid ${scoreColor}">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                        <h4 style="margin:0;color:#4facfe">${assessment.career}</h4>
                        <span style="font-size:24px;font-weight:bold;color:${scoreColor}">${assessment.score}%</span>
                    </div>
                    <p style="margin:5px 0;color:rgba(255,255,255,0.6);font-size:13px">Completed: ${date}</p>
                    <div style="margin-top:10px">
                        <span style="font-size:13px;color:rgba(255,255,255,0.5)">Tech Stack:</span>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:5px">
                            ${assessment.tech_stack.map(tech => `<span style="background:rgba(79,172,254,0.2);padding:4px 10px;border-radius:12px;font-size:12px">${tech}</span>`).join("")}
                        </div>
                    </div>
                </div>
            `
        }).join("")

    } catch (error) {

        console.error("Error loading assessments:", error)
        // Fallback: Load from localStorage
        const savedAssessments = JSON.parse(localStorage.getItem("savedAssessments") || "[]")
        const assessmentsList = document.getElementById("assessmentsList")
        if (assessmentsList) {
            if (savedAssessments.length > 0) {
                assessmentsList.innerHTML = savedAssessments.map(assessment => {
                    const date = new Date(assessment.completedAt).toLocaleDateString()
                    const scoreColor = assessment.score >= 80 ? "#3ecf8e" : assessment.score >= 60 ? "#4facfe" : "#ff9800"

                    return `
                        <div class="assessment-item" style="padding:15px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:10px;border-left:4px solid ${scoreColor}">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                                <h4 style="margin:0;color:#4facfe">${assessment.career}</h4>
                                <span style="font-size:24px;font-weight:bold;color:${scoreColor}">${assessment.score}%</span>
                            </div>
                            <p style="margin:5px 0;color:rgba(255,255,255,0.6);font-size:13px">Completed: ${date}</p>
                            <div style="margin-top:10px">
                                <span style="font-size:13px;color:rgba(255,255,255,0.5)">Tech Stack:</span>
                                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:5px">
                                    ${assessment.techStack.map(tech => `<span style="background:rgba(79,172,254,0.2);padding:4px 10px;border-radius:12px;font-size:12px">${tech}</span>`).join("")}
                                </div>
                            </div>
                        </div>
                    `
                }).join("")
            } else {
                assessmentsList.innerHTML = `<p style="color:rgba(255,255,255,0.5)">Failed to load assessments.</p>`
            }
        }

    }

}

// Load Job Applications

async function loadJobApplications() {

    try {

        const token = localStorage.getItem("token")

        // Get userId from token
        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload))
        const userId = decoded.userId

        const res = await fetch(`/api/tracker?userId=${userId}`)

        const data = await res.json()

        const jobApplicationsList = document.getElementById("jobApplicationsList")

        if (!data || data.length === 0) {
            jobApplicationsList.innerHTML = `<p style="color:rgba(255,255,255,0.5)">No job applications yet.</p>`
            return
        }

        jobApplicationsList.innerHTML = data.map(item => {
            const statusColor = item.status === "Offer" ? "#3ecf8e" : item.status === "Interview" ? "#4facfe" : item.status === "Rejected" ? "#ff9800" : "rgba(255,255,255,0.7)"

            return `
                <div style="padding:15px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:10px;border-left:4px solid ${statusColor}">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                        <h4 style="margin:0;color:#4facfe">${item.company}</h4>
                        <span style="font-weight:bold;color:${statusColor}">${item.status}</span>
                    </div>
                    <p style="margin:5px 0;color:rgba(255,255,255,0.6);font-size:13px">Role: ${item.role}</p>
                </div>
            `
        }).join("")

    } catch (error) {

        console.error("Error loading job applications:", error)
        const jobApplicationsList = document.getElementById("jobApplicationsList")
        if (jobApplicationsList) {
            jobApplicationsList.innerHTML = `<p style="color:rgba(255,255,255,0.5)">Failed to load job applications.</p>`
        }

    }

}

// Load Resume Analysis

async function loadResumeAnalysis() {

    try {

        const token = localStorage.getItem("token")

        // Get userId from token
        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload))
        const userId = decoded.userId

        const res = await fetch(`/api/resume?userId=${userId}`)

        const data = await res.json()

        const resumeAnalysisList = document.getElementById("resumeAnalysisList")

        if (!data.analyses || data.analyses.length === 0) {
            resumeAnalysisList.innerHTML = `<p style="color:rgba(255,255,255,0.5)">No resume analyses yet.</p>`
            return
        }

        resumeAnalysisList.innerHTML = data.analyses.slice(0, 3).map(analysis => {
            const date = new Date(analysis.created_at).toLocaleDateString()
            const scoreColor = analysis.resume_score >= 80 ? "#3ecf8e" : analysis.resume_score >= 60 ? "#4facfe" : "#ff9800"

            return `
                <div style="padding:15px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:10px;border-left:4px solid ${scoreColor}">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                        <h4 style="margin:0;color:#4facfe">Resume Score</h4>
                        <span style="font-size:24px;font-weight:bold;color:${scoreColor}">${analysis.resume_score}%</span>
                    </div>
                    <p style="margin:5px 0;color:rgba(255,255,255,0.6);font-size:13px">ATS Score: ${analysis.ats_score}% | Analyzed: ${date}</p>
                    <div style="margin-top:10px">
                        <span style="font-size:13px;color:rgba(255,255,255,0.5)">Skills:</span>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:5px">
                            ${analysis.skills.slice(0, 5).map(skill => `<span style="background:rgba(79,172,254,0.2);padding:4px 10px;border-radius:12px;font-size:12px">${skill}</span>`).join("")}
                        </div>
                    </div>
                </div>
            `
        }).join("")

    } catch (error) {

        console.error("Error loading resume analysis:", error)
        const resumeAnalysisList = document.getElementById("resumeAnalysisList")
        if (resumeAnalysisList) {
            resumeAnalysisList.innerHTML = `<p style="color:rgba(255,255,255,0.5)">Failed to load resume analysis.</p>`
        }

    }

}

// Load User

function loadUser() {

    const user = JSON.parse(
        localStorage.getItem("user")
    )

    if (user) {

        document.getElementById("userName")
            .innerText = "Hi, " + user.name

    }

}


// Navigation

function go(page) {

    window.location.href = page

}


// Logout

function logout() {

    localStorage.removeItem("token")

    window.location.href = "login.html"

}


// Loader

function showLoader() {

    let loader = document
        .getElementById("loader")

    if (!loader) {

        loader = document.createElement("div")

        loader.id = "loader"

        loader.innerHTML = `
<div class="loader-spinner"></div>
`

        document.body.appendChild(loader)

    }

    loader.style.display = "flex"

}


function hideLoader() {

    const loader = document
        .getElementById("loader")

    if (loader)
        loader.style.display = "none"

}


// Init

document.addEventListener("DOMContentLoaded", () => {

    loadDashboard()

})