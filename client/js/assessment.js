const token = localStorage.getItem("token")

// Helper function to decode JWT and get userId
function getUserIdFromToken() {
  try {
    if (!token) {
      console.error("No token found")
      return null
    }
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded.userId
  } catch (error) {
    console.error("Error decoding token", error)
    return null
  }
}

const userId = getUserIdFromToken()

let currentQuestion = 0
let questions = []
let answers = []
let currentAssessment = null

const progressBar = document.getElementById("progress-bar")

// Start Assessment
async function startAssessment() {

  // Check if user is logged in
  if (!token) {
    alert("Please login first.")
    window.location.href = "login.html"
    return
  }

  // Check if user has a roadmap
  const savedRoadmap = localStorage.getItem("savedRoadmap")

  if (!savedRoadmap) {
    alert("Please generate a roadmap first before taking an assessment.")
    window.location.href = "roadmap.html"
    return
  }

  document.getElementById("start-screen").style.display = "none"
  document.getElementById("question-screen").style.display = "block"
  document.getElementById("progress-container").style.display = "block"

  await generateQuestionsFromRoadmap()

  // Check if questions were generated successfully
  if (questions.length === 0) {
    alert("Failed to generate assessment questions. Please try again.")
    document.getElementById("question-screen").style.display = "none"
    document.getElementById("progress-container").style.display = "none"
    document.getElementById("start-screen").style.display = "block"
    return
  }

  showQuestion()

}

// Generate Questions from Roadmap using Groq API
async function generateQuestionsFromRoadmap() {

  let roadmapData = null
  let skills = []
  let career = "Career"

  try {

    showLoader()

    const savedRoadmap = localStorage.getItem("savedRoadmap")
    roadmapData = JSON.parse(savedRoadmap)

    skills = roadmapData.skills || []
    career = roadmapData.career?.title || roadmapData.career || "Career"

    // Generate assessment questions based on roadmap skills
    const prompt = `
Generate 5 assessment questions to test knowledge of the following skills for a ${career} role:

Skills: ${skills.join(", ")}

Return JSON format:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "skill": "Related skill name",
      "explanation": "Brief explanation of the correct answer"
    }
  ],
  "techStack": ["Technology 1", "Technology 2", "Technology 3"]
}

Make questions practical and related to real-world scenarios.
`

    const res = await fetch("/api/assessment/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        prompt,
        userId
      })
    })

    const data = await res.json()

    if (!res.ok || data.error) {
      console.error("API Error:", data.error || "Unknown error")
      throw new Error(data.error || "Failed to generate questions")
    }

    questions = data.questions || []

    currentAssessment = {
      career: career,
      skills: skills,
      techStack: data.techStack || [],
      questions: questions,
      completedAt: null
    }

    hideLoader()

  } catch (error) {

    console.error(error)

    // Fallback: Generate varied questions based on skills if AI fails
    const fallbackSkills = roadmapData?.skills || ["General"]
    const techStack = roadmapData?.skills || ["General Technology"]

    const questionTemplates = [
      {
        question: (skill) => `What is ${skill} primarily used for?`,
        options: ["Web development", "Mobile apps", "Data science", "All of the above"],
        correctAnswer: "All of the above",
        explanation: (skill) => `${skill} is a versatile technology used in various domains.`
      },
      {
        question: (skill) => `Which framework is commonly used with ${skill}?`,
        options: ["React", "Angular", "Vue", "Django"],
        correctAnswer: "React",
        explanation: (skill) => `React is widely used with ${skill} for building user interfaces.`
      },
      {
        question: (skill) => `What is a key benefit of using ${skill}?`,
        options: ["Performance", "Scalability", "Developer experience", "All of the above"],
        correctAnswer: "All of the above",
        explanation: (skill) => `${skill} offers multiple benefits including performance, scalability, and better developer experience.`
      },
      {
        question: (skill) => `Which database works well with ${skill}?`,
        options: ["PostgreSQL", "MongoDB", "MySQL", "All can work"],
        correctAnswer: "All can work",
        explanation: (skill) => `${skill} can integrate with various database systems depending on requirements.`
      },
      {
        question: (skill) => `What is the learning curve for ${skill}?`,
        options: ["Easy", "Moderate", "Difficult", "Very difficult"],
        correctAnswer: "Moderate",
        explanation: (skill) => `${skill} has a moderate learning curve with good documentation available.`
      }
    ]

    questions = fallbackSkills.slice(0, 5).map((skill, index) => {
      const template = questionTemplates[index % questionTemplates.length]
      return {
        question: template.question(skill),
        options: template.options,
        correctAnswer: template.correctAnswer,
        skill: skill,
        explanation: typeof template.explanation === 'function' ? template.explanation(skill) : template.explanation
      }
    })

    currentAssessment = {
      career: roadmapData?.career?.title || roadmapData?.career || "Career",
      skills: fallbackSkills,
      techStack: techStack,
      questions: questions,
      completedAt: null
    }

    console.log("Using fallback questions")

    hideLoader()

  }

}

// Show Question
function showQuestion() {

  const q = questions[currentQuestion]

  document.getElementById("question-number").innerText =
    `Question ${currentQuestion + 1} of ${questions.length}`

  document.getElementById("question").innerText = q.question

  updateProgress()

  const options = document.getElementById("options")

  options.innerHTML = ""

  q.options.forEach(option => {

    const btn = document.createElement("button")

    btn.className = "btn option-btn animate-fade-in"
    btn.style.color = "white"

    btn.innerText = option

    btn.onclick = () => selectAnswer(option)

    options.appendChild(btn)

  })

}

// Select Answer
function selectAnswer(answer) {

  answers.push(answer)

  currentQuestion++

  if (currentQuestion < questions.length) {

    showQuestion()

  } else {

    submitAssessment()

  }

}

// Submit Assessment
async function submitAssessment() {

  showLoader()

  try {

    // Calculate score
    let correctAnswers = 0
    questions.forEach((q, index) => {
      if (q.correctAnswer === answers[index]) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / questions.length) * 100)

    // Update current assessment with results
    currentAssessment.answers = answers
    currentAssessment.score = score
    currentAssessment.completedAt = new Date().toISOString()

    // Save assessment to database
    try {
      const saveRes = await fetch("/api/assessment/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({
          assessment: currentAssessment,
          userId
        })
      })

      if (!saveRes.ok) {
        throw new Error("Database save failed")
      }

      const saveData = await saveRes.json()
      console.log("Save assessment response:", saveData)
    } catch (error) {
      console.error("Error saving assessment to database:", error)
      // Fallback: Save to localStorage
      const savedAssessments = JSON.parse(localStorage.getItem("savedAssessments") || "[]")
      savedAssessments.push(currentAssessment)
      localStorage.setItem("savedAssessments", JSON.stringify(savedAssessments))
      console.log("Assessment saved to localStorage as fallback")
    }

    document.getElementById("question-screen").style.display = "none"
    document.getElementById("progress-container").style.display = "none"
    document.getElementById("result-screen").style.display = "block"

    // Display result with completion button
    const resultHTML = `
<div style="text-align:center;padding:20px">
<h3 style="color:#4facfe;margin-bottom:20px">Assessment Completed!</h3>
<div style="font-size:48px;font-weight:bold;color:#3ecf8e;margin-bottom:10px">${score}%</div>
<p style="color:rgba(255,255,255,0.7);margin-bottom:20px">You got ${correctAnswers} out of ${questions.length} questions correct</p>
<div style="margin:20px 0;padding:15px;background:rgba(79,172,254,0.1);border-radius:8px">
<h4 style="margin:0 0 10px 0">Tech Stack Covered:</h4>
<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">
${currentAssessment.techStack.map(tech => `<span style="background:rgba(79,172,254,0.2);padding:5px 12px;border-radius:15px;font-size:13px">${tech}</span>`).join("")}
</div>
</div>
</div>
<button class="btn btn-primary" onclick="goToDashboard()" style="margin-top:20px">Go to Dashboard</button>
</div>
`

    document.getElementById("result").innerHTML = resultHTML

    // Reload previous assessments to show the newly completed one
    loadPreviousAssessments()

    hideLoader()

  } catch (error) {

    console.error(error)

    alert("Error submitting assessment")

    hideLoader()

  }

}

// Go To Dashboard
function goToDashboard() {

  window.location.href = "dashboard.html"

}

// Progress Bar
function updateProgress() {

  if (!progressBar) return

  const progress =
    ((currentQuestion) / questions.length) * 100

  progressBar.style.width = progress + "%"

}

// Loader
function showLoader() {

  let loader = document.getElementById("loader")

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

  const loader = document.getElementById("loader")

  if (loader) loader.style.display = "none"

}

// Go To Roadmap
function goToRoadmap() {

  window.location.href = "roadmap.html"

}

// Restart Assessment
function restartAssessment() {

  currentQuestion = 0
  answers = []

  document.getElementById("result-screen").style.display = "none"
  document.getElementById("start-screen").style.display = "block"

}

// Logout
function logout() {

  localStorage.removeItem("token")
  window.location.href = "login.html"

}

// Load Previous Assessments
async function loadPreviousAssessments() {

  try {

    const token = localStorage.getItem("token")

    if (!token) {
      console.error("No token found")
      return
    }

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

    const previousAssessmentsDiv = document.getElementById("previousAssessments")

    if (!data.assessments || data.assessments.length === 0) {
      // Fallback: Try loading from localStorage
      const savedAssessments = JSON.parse(localStorage.getItem("savedAssessments") || "[]")
      if (savedAssessments.length > 0) {
        previousAssessmentsDiv.innerHTML = savedAssessments.map(assessment => {
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
        previousAssessmentsDiv.innerHTML = `<p style="color:rgba(255,255,255,0.5)">No assessments completed yet.</p>`
      }
      return
    }

    previousAssessmentsDiv.innerHTML = data.assessments.map(assessment => {
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

    console.error("Error loading previous assessments:", error)
    // Fallback: Load from localStorage
    const savedAssessments = JSON.parse(localStorage.getItem("savedAssessments") || "[]")
    const previousAssessmentsDiv = document.getElementById("previousAssessments")
    if (previousAssessmentsDiv) {
      if (savedAssessments.length > 0) {
        previousAssessmentsDiv.innerHTML = savedAssessments.map(assessment => {
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
        previousAssessmentsDiv.innerHTML = `<p style="color:rgba(255,255,255,0.5)">Failed to load assessments.</p>`
      }
    }

  }

}

// Load previous assessments on page load
document.addEventListener("DOMContentLoaded", () => {
  loadPreviousAssessments()
})