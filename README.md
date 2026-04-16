# 🚀 Margadarshak AI

AI-powered career assistant platform that helps users prepare for interviews, analyze resumes, and improve skills using intelligent feedback.

---

## ✨ Features

### 🎤 AI Interview Simulator
- Dynamic interview questions (role-based)
- Voice input support (speech recognition)
- Real-time question flow
- AI-based evaluation & scoring
- Feedback with strengths & improvements

---

### 📄 Resume Analyzer
- Upload PDF resume
- Extracts content automatically
- AI evaluates:
  - Resume score
  - ATS score
  - Skills detected
  - Suggestions for improvement
- Stores previous analyses
- Downloadable report (PDF)

---

### 📊 Dashboard
- Overview of performance
- Resume & interview insights
- Clean SaaS-style UI

---

### 📚 Roadmap & Tracker
- Track learning progress
- Career roadmap guidance

---

### 🧠 AI Mentor (English / Communication)
- Practice communication
- Improve speaking skills

---

## 🛠️ Tech Stack

### Frontend
- HTML, CSS, JavaScript
- Web Speech API (Voice Input)
- PDF.js (Resume parsing)

### Backend
- Node.js
- Express.js

### Database & Storage
- Supabase (PostgreSQL)
- Supabase Storage (for files)

### AI Integration
- OpenAI API (or custom AI service)

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-username/margadarshak-ai.git
cd margadarshak-ai
2. Install Dependencies
Bash
npm install
3. Setup Environment Variables
Create .env file:
Environment
PORT=3000

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

OPENAI_API_KEY=your_openai_key
4. Run Server
Bash
npm run dev
Server runs at:
Plain text
http://localhost:3000
📁 Project Structure
Plain text
server/
 ├── controllers/
 ├── routes/
 ├── services/
 └── index.js

client/
 ├── pages/
 ├── js/
 └── css/
🎤 Voice Feature Requirements
Use Google Chrome
Allow microphone access
Works on localhost or HTTPS
🧪 API Endpoints
Interview
GET /api/interview/questions
POST /api/interview/submit
GET /api/interview/report
Resume
POST /api/resume/analyze
GET /api/resume
⚠️ Notes
Speech recognition may not work in all browsers
Ensure Supabase tables are created correctly
Resume must be in PDF format
🔥 Future Enhancements
AI video interviewer (avatar + voice)
Real-time scoring
Multi-language support
Advanced analytics dashboard
👨‍💻 Author
Kishan Deshpande
⭐ If you like this project
Give it a ⭐ on GitHub!