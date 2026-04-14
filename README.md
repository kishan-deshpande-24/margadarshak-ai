# Margadarshak AI - Complete SaaS Platform

**Margadarshak AI** is a premium, AI-powered career guidance platform designed to help users navigate their career paths with personalized roadmaps, resume analysis, interview simulations, and voice-enabled English mentoring.

## 🌟 Key Features

### 🎨 Premium UI/UX
- **Glassmorphism Design**: Modern frosted glass effect with backdrop blur
- **Gradient Animations**: Smooth color transitions and entrance animations
- **Responsive Layout**: Fully optimized for mobile, tablet, and desktop
- **Dark Theme**: Eye-friendly interface with vibrant accent colors

### 🧠 AI-Powered Features
- **Dynamic Interest Assessment**: AI generates unique questions each session, never repeating
- **Personalized Roadmaps**: Step-by-step learning paths with skills and projects
- **Resume Analyzer**: AI-powered scoring with detailed feedback and suggestions
- **Interview Simulator**: Realistic Zoom-style video interview with dynamic questions
- **Voice-Enabled English Mentor**: Real-time speech recognition and AI feedback

### 📊 Data & Analytics
- **Colorful PDF Reports**: Download beautifully designed assessment and roadmap PDFs
- **Progress Tracking**: Visual charts showing skill development and achievements
- **Unified Profile**: Integrated dashboard with all achievements and statistics
- **Real-time Feedback**: Instant AI-powered corrections and suggestions

### 🔐 Security & Integrity
- **Advanced Cheating Detection**: Tab switching, fullscreen exit, copy/paste monitoring
- **Session Integrity**: Ensures fair and valid interview simulations
- **User Authentication**: Secure login and signup with profile management

## 🧱 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | HTML5, CSS3 (Glassmorphism), JavaScript (Vanilla) |
| **Backend** | Node.js, Express.js |
| **Database** | Supabase (PostgreSQL) |
| **AI Integration** | OpenAI API (GPT-4) |
| **Charts** | Chart.js |
| **PDF Generation** | PDFKit, html2pdf.js |
| **Voice** | Web Speech API |

## 📁 Project Structure

```
margadarshak-ai/
├── client/
│   ├── assets/
│   │   └── logo.png              # Professional gradient logo
│   ├── css/
│   │   └── style.css             # Global design system with animations
│   ├── js/
│   │   ├── layout.js             # Shared sidebar and navbar
│   │   └── cheating-detection.js # Interview integrity monitoring
│   ├── pages/
│   │   ├── login.html            # Premium animated login
│   │   ├── signup.html           # Premium animated signup
│   │   ├── dashboard.html        # Main dashboard with charts
│   │   ├── assessment.html       # Dynamic assessment with PDF download
│   │   ├── roadmap.html          # Colorful roadmap with PDF export
│   │   ├── resume.html           # Resume analyzer with scoring
│   │   ├── interview.html        # Interview simulator with dynamic questions
│   │   ├── mentor.html           # Voice-enabled English mentor
│   │   ├── tracker.html          # Company readiness tracker
│   │   ├── teams.html            # Team finder with matching
│   │   ├── community.html        # Social community features
│   │   ├── profile.html          # Unified profile with achievements
│   │   └── settings.html         # User settings and preferences
│   └── index.html                # Landing page
├── server/
│   ├── controllers/
│   │   └── authController.js     # Authentication logic
│   ├── routes/
│   │   └── auth.js               # Auth endpoints
│   ├── services/
│   │   ├── supabase.js           # Database client
│   │   ├── openai.js             # AI integration
│   │   └── pdfGenerator.js       # Colorful PDF creation
│   └── index.js                  # Express server
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm
- Supabase account (free tier available)
- OpenAI API key

### Step 1: Clone and Install
```bash
cd margadarshak-ai
npm install
```

### Step 2: Environment Setup
Create a `.env` file in the root directory:
```env
PORT=3000
OPENAI_API_KEY=sk-your_openai_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Step 3: Database Setup (Supabase)
Create these tables in your Supabase project:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assessments table
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  questions JSONB,
  results JSONB,
  score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Roadmaps table
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  steps JSONB,
  progress INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Resumes table
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  score INTEGER,
  analysis JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Interviews table
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  questions JSONB,
  answers JSONB,
  score INTEGER,
  violations JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 4: Run the Application
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## 🎨 Design System

The application features a premium **Glassmorphism UI** with:
- **Color Palette**: Green (#22c55e), Blue (#38bdf8), Purple (#a78bfa)
- **Backdrop Blur**: 12px blur effect on all cards
- **Animations**: Smooth fade-in, slide, and scale transitions
- **Typography**: Inter font family for modern appearance
- **Spacing**: Consistent 1.5rem base spacing unit

## ✨ Premium Features

### 1. Dynamic Question Generation
Every assessment and interview session generates unique questions using OpenAI, ensuring no repetition and personalized experiences.

### 2. Colorful PDF Reports
Download beautifully designed PDFs with:
- Gradient backgrounds
- Charts and visualizations
- Professional formatting
- Personalized recommendations

### 3. Voice-Enabled English Mentor
- Real-time speech recognition
- AI-powered feedback
- Pronunciation analysis
- Confidence scoring

### 4. Advanced Cheating Detection
- Tab switching detection
- Fullscreen monitoring
- Copy/paste prevention
- Visual integrity checks

### 5. Unified User Profile
- Integrated achievements dashboard
- Progress tracking across all modules
- Activity timeline
- Skill development charts

## 🔐 Authentication

The project includes a dummy authentication system for immediate demonstration. For production use:

1. Connect `authController.js` to Supabase Auth
2. Implement JWT token validation
3. Add password hashing with bcryptjs
4. Enable OAuth integrations (Google, GitHub)

## 📱 Responsive Design

All pages are fully responsive and optimized for:
- **Mobile**: 320px and up
- **Tablet**: 768px and up
- **Desktop**: 1024px and up
- **Large Screens**: 1440px and up

## 🛠 Development

### Adding New Features

1. **New Page**: Create HTML file in `/client/pages/`
2. **Styling**: Add CSS to `/client/css/style.css`
3. **Logic**: Add JavaScript to `/client/js/`
4. **API**: Create routes in `/server/routes/`

### Building PDFs

Use the `pdfGenerator.js` service:
```javascript
const pdfGen = require('./services/pdfGenerator');
await pdfGen.generateAssessmentReport(data, 'report.pdf');
```

## 📚 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/auth/login` | POST | User login |
| `/api/auth/signup` | POST | User registration |
| `/api/assessment` | POST | Generate assessment |
| `/api/roadmap` | POST | Generate roadmap |
| `/api/resume` | POST | Analyze resume |
| `/api/interview` | POST | Generate interview |

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Heroku
```bash
heroku create your-app-name
git push heroku main
```

### Docker
```bash
docker build -t margadarshak-ai .
docker run -p 3000:3000 margadarshak-ai
```

## 📝 License

This project is open-source and available under the MIT License.

## 🤝 Support

For issues, feature requests, or questions, please open an issue on GitHub or contact support@margadarshak.ai.

---

**Built with ❤️ by Manus AI**

Transform your career journey with AI-powered guidance. Start learning today!
