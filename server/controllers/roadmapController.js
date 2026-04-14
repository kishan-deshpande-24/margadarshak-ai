const askAI = require("../services/openai")
const supabase = require("../services/supabase")

// ==============================
// Generate Roadmap
// ==============================

exports.generateRoadmap = async (req,res)=>{

try{

const { career, userId } = req.body

const prompt = `

Create a learning roadmap for: ${career}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanations, just JSON.

Use this exact structure:
{
  "career": "${career}",
  "description": "Brief description",
  "roadmap": [
    {
      "title": "Step title",
      "description": "What to learn",
      "skills": ["skill1", "skill2", "skill3"],
      "resources": ["resource1"],
      "duration": "time estimate"
    }
  ],
  "skills": ["all skills"],
  "projects": [
    {
      "name": "Project name",
      "description": "What to build",
      "technologies": ["tech1"],
      "difficulty": "Beginner"
    }
  ]
}

Include 6-8 steps, 15-20 skills, 4-6 projects.
`

const response = await askAI(prompt)

console.log("AI Response:", response)

let roadmapData

try{

roadmapData = JSON.parse(response)

// Validate the parsed data has required fields
if(!roadmapData.roadmap || !Array.isArray(roadmapData.roadmap)){
throw new Error("Invalid roadmap structure")
}

}catch(error){

console.error("JSON Parse Error:", error)
console.error("Response was:", response)

// Fallback roadmap if AI fails
roadmapData = {
  career: career,
  description: `Learn ${career} from basics to advanced`,
  roadmap: [
    {
      title: "Fundamentals",
      description: `Learn the basics of ${career} including core concepts, terminology, and setup`,
      skills: ["Basic concepts", "Terminology", "Setup", "Environment configuration"],
      resources: ["Official documentation", "Online tutorials"],
      duration: "2-3 weeks"
    },
    {
      title: "Core Skills",
      description: "Master the core skills required for proficiency",
      skills: ["Core concepts", "Best practices", "Common patterns", "Debugging"],
      resources: ["Practice exercises", "Code examples"],
      duration: "4-6 weeks"
    },
    {
      title: "Advanced Topics",
      description: "Learn advanced techniques and optimization",
      skills: ["Advanced concepts", "Optimization", "Performance tuning", "Security"],
      resources: ["Advanced tutorials", "Case studies"],
      duration: "6-8 weeks"
    },
    {
      title: "Practical Application",
      description: "Apply knowledge through real-world projects",
      skills: ["Project planning", "Implementation", "Testing", "Deployment"],
      resources: ["Project templates", "Deployment guides"],
      duration: "4-6 weeks"
    }
  ],
  skills: ["Basic concepts", "Terminology", "Setup", "Environment configuration", "Core concepts", "Best practices", "Common patterns", "Debugging", "Advanced concepts", "Optimization", "Performance tuning", "Security", "Project planning", "Implementation", "Testing", "Deployment"],
  projects: [
    {
      name: "Beginner Project",
      description: "Apply basic concepts in a simple project to build foundational skills",
      technologies: ["Core technologies"],
      difficulty: "Beginner"
    },
    {
      name: "Intermediate Project",
      description: "Build a more complex application that integrates multiple concepts",
      technologies: ["Advanced tools"],
      difficulty: "Intermediate"
    },
    {
      name: "Advanced Project",
      description: "Create a professional-grade project showcasing full mastery",
      technologies: ["Professional stack"],
      difficulty: "Advanced"
    }
  ]
}

}


// Save roadmap

await supabase
.from("roadmap")
.insert([{

user_id:userId,
career,
roadmap: roadmapData.roadmap,
skills: roadmapData.skills,
projects: roadmapData.projects

}])


res.json(roadmapData)

}catch(error){

console.error(error)

res.json({

career: career,
description: "Error generating roadmap",
roadmap: [],
skills: [],
projects: []

})

}

}


// ==============================
// Get Roadmap
// ==============================

exports.getRoadmap = async (req,res)=>{

try{

const { userId } = req.query

const { data } = await supabase
.from("roadmap")
.select("*")
.eq("user_id",userId)
.order("created_at",{ascending:false})
.limit(1)

res.json(data[0] || {})

}catch(error){

res.json({})

}

}



// ==============================
// Update Progress
// ==============================

exports.updateProgress = async (req,res)=>{

try{

const { id, progress } = req.body

await supabase
.from("roadmap")
.update({

progress

})
.eq("id", id)

res.json({

message:"Progress updated"

})

}catch(error){

res.json({

message:"Error updating"

})

}

}


// ==============================
// Download Roadmap as PDF
// ==============================

exports.downloadRoadmap = async (req,res)=>{

try{

const { userId } = req.query

const { data } = await supabase
.from("roadmap")
.select("*")
.eq("user_id",userId)
.order("created_at",{ascending:false})
.limit(1)

if(!data || data.length === 0){

return res.json({error:"No roadmap found"})

}

const roadmap = data[0]

// Generate HTML for PDF
const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Roadmap - ${roadmap.career}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            text-align: center;
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .section {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { margin: 0; }
        h2 { color: #4facfe; margin-top: 0; }
        .step {
            margin-bottom: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
            border-left: 4px solid #4facfe;
        }
        .skill {
            display: inline-block;
            background: #e3f2fd;
            color: #1976d2;
            padding: 5px 10px;
            border-radius: 15px;
            margin: 5px;
            font-size: 14px;
        }
        .project {
            margin-bottom: 15px;
            padding: 15px;
            background: #fff3e0;
            border-radius: 8px;
            border-left: 4px solid #ff9800;
        }
        .difficulty {
            display: inline-block;
            background: #ff9800;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 10px;
        }
        .resource {
            background: #e8f5e9;
            color: #2e7d32;
            padding: 8px;
            border-radius: 4px;
            margin: 5px 0;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Roadmap: ${roadmap.career}</h1>
        <p>Generated by Margadarshak AI</p>
    </div>

    <div class="section">
        <h2>Description</h2>
        <p>Your personalized learning path for ${roadmap.career}</p>
    </div>

    <div class="section">
        <h2>Learning Steps</h2>
        ${roadmap.roadmap ? roadmap.roadmap.map((step, index) => `
            <div class="step">
                <h3>Step ${index + 1}: ${step.title}</h3>
                <p>${step.description}</p>
                ${step.duration ? `<p><strong>Duration:</strong> ${step.duration}</p>` : ''}
                <div>
                    <strong>Skills:</strong><br>
                    ${step.skills ? step.skills.map(skill => `<span class="skill">${skill}</span>`).join('') : ''}
                </div>
                ${step.resources ? `
                    <div style="margin-top:10px">
                        <strong>Resources:</strong><br>
                        ${step.resources.map(resource => `<div class="resource">${resource}</div>`).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('') : ''}
    </div>

    <div class="section">
        <h2>All Skills</h2>
        ${roadmap.skills ? roadmap.skills.map(skill => `<span class="skill">${skill}</span>`).join('') : ''}
    </div>

    <div class="section">
        <h2>Recommended Projects</h2>
        ${roadmap.projects ? roadmap.projects.map(project => `
            <div class="project">
                <h4>${project.name}${project.difficulty ? `<span class="difficulty">${project.difficulty}</span>` : ''}</h4>
                <p>${project.description}</p>
                ${project.technologies ? `
                    <div>
                        <strong>Technologies:</strong>
                        ${project.technologies.map(tech => `<span class="skill">${tech}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('') : ''}
    </div>

    <div style="text-align:center;color:#666;font-size:12px;margin-top:20px">
        Generated by Margadarshak AI - Your AI Career Guide
    </div>
</body>
</html>
`

// Send HTML as response (client can print to PDF)
res.setHeader('Content-Type', 'text/html')
res.send(html)

}catch(error){

console.error("Download error:", error)
res.json({error:"Error generating PDF"})

}

}