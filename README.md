# Margadarshak AI

## Overview

Margadarshak AI is an AI-powered career development and interview preparation platform designed to help students and professionals improve their technical skills, communication abilities, interview performance, and overall career readiness.

The platform combines artificial intelligence, real-time communication, analytics, resume evaluation, career guidance, and collaborative learning into a single ecosystem. Users can assess their interests, generate personalized roadmaps, analyze resumes, practice company-specific interviews, improve English communication, collaborate with teams, and track their progress through an interactive dashboard.

---

## Core Features

### Authentication & User Management

* Email and phone-based authentication
* JWT-based authorization
* Google OAuth integration
* Password recovery workflow
* User onboarding experience
* Profile management

---

### Interest Assessment

* AI-powered adaptive assessments
* Dynamic question generation
* Personalized career recommendations
* Career suitability scoring
* Downloadable reports

---

### Career Roadmap Generator

* Personalized learning paths
* Skill recommendations
* Project suggestions
* Certification guidance
* Progress tracking
* Milestone management

---

### Resume Analyzer

* PDF resume upload
* Resume parsing and analysis
* ATS compatibility scoring
* Skill extraction
* Missing skill identification
* AI-generated improvement suggestions
* Resume history tracking
* Professional PDF reports

---

### AI Interview Simulator

Supports preparation for leading technology companies, including:

* Google
* Microsoft
* Amazon
* Meta
* Apple
* Netflix
* Adobe
* Salesforce
* Uber
* Airbnb
* Oracle
* IBM
* Samsung
* Infosys
* TCS
* Wipro
* Accenture
* Zoho
* Paytm
* Flipkart

Interview modules include:

* HR Interview
* Technical Interview
* Behavioral Interview
* Coding Assessment
* System Design Discussion

Features:

* Dynamic question generation
* Company-specific interview workflows
* Voice interaction
* Real-time feedback
* Interview analytics
* Coding evaluation
* Communication assessment

---

### English Communication Mentor

* Speaking practice
* Grammar correction
* Pronunciation feedback
* Vocabulary enhancement
* Fluency evaluation
* Confidence assessment
* Personalized recommendations

---

### Company Readiness Tracker

Evaluate readiness for target companies using:

* Skill readiness
* Resume readiness
* Interview readiness
* Communication readiness
* Project readiness

Includes:

* Readiness scoring
* Gap analysis
* Recommendations
* Progress visualization

---

### Team Finder

Match users based on:

* Skills
* Interests
* Project domains
* Experience levels

Features:

* Compatibility scoring
* Team creation
* Team collaboration
* Shared discussions

---

### Community Platform

* Create posts
* Comment and reply
* Like discussions
* Participate in career-related conversations
* Share project experiences
* Community engagement tracking

---

### Notifications System

Provides updates for:

* Assessments
* Roadmaps
* Team activities
* Community interactions
* Interview reminders
* Learning milestones

---

### Badge & Achievement System

Track accomplishments across:

* Assessments
* Interview preparation
* Resume improvement
* English communication
* Team collaboration
* Community participation

---

### AI Assistant

Integrated AI-powered assistance for:

* Career guidance
* Interview preparation
* Resume recommendations
* Learning suggestions
* Personalized support

---

## Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Chart.js
* PDF.js
* Lucide Icons

### Backend

* Node.js
* Express.js
* JWT Authentication
* Mongoose

### Database

* MongoDB Atlas

### Artificial Intelligence

* OpenAI API

### Real-Time Features

* Socket.IO
* LiveKit

### Code Execution

* Judge0 API

### Communication Services

* Nodemailer
* Twilio

### PDF Generation

* Puppeteer

---

## Project Structure

```text
Margadarshak-AI
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── sockets
│   │   ├── utils
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env.example
│
├── frontend
│   ├── public
│   │   ├── css
│   │   ├── js
│   │   ├── pages
│   │   └── index.html
│   │
│   └── package.json
│
└── README.md
```

---

## Backend Modules

### Controllers

* Authentication Controller
* Assessment Controller
* Resume Controller
* Roadmap Controller
* Interview Controller
* English Mentor Controller
* Community Controller
* Team Controller
* Company Tracker Controller
* Notification Controller
* Chat Controller
* User Controller

### Models

* User
* Assessment
* Resume
* Roadmap
* Interview
* English Session
* Team
* Chat
* Badge
* Notification
* Todo
* Post

### Services

* OpenAI Service
* Email Service
* PDF Service
* Twilio Service

---

## API Modules

```text
/api/auth
/api/assessment
/api/roadmap
/api/resume
/api/interview
/api/english
/api/teams
/api/community
/api/companies
/api/users
/api/chat
/api/notifications
/api/todos
/api/analytics
/api/pdf
/api/livekit
/api/judge0
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd margadarshak-ai
```

### Backend Setup

```bash
cd backend
npm install
```

### Frontend Setup

```bash
cd frontend
npm install
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000

MONGODB_URI=

JWT_SECRET=

OPENAI_API_KEY=

EMAIL_USER=
EMAIL_PASS=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

JUDGE0_API_KEY=
```

---

## Running the Project

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd frontend
npm start
```

---

## Generated Reports

The platform generates downloadable PDF reports for:

* Interest Assessment
* Career Roadmap
* Resume Analysis
* Interview Evaluation
* English Communication Assessment
* Company Readiness Analysis
* Career Readiness Summary

Reports include:

* Performance metrics
* Charts and analytics
* AI recommendations
* Improvement plans
* Progress tracking

---

## Future Enhancements

* Advanced AI Interview Avatar
* Live Video Interview Analytics
* Real-Time Team Collaboration
* Enhanced Coding Evaluation
* Personalized Learning Recommendations
* Enterprise Dashboard
* Recruiter Portal

---

## Objective

The objective of Margadarshak AI is to provide a comprehensive, AI-driven platform that empowers users to develop technical skills, improve communication abilities, prepare for interviews, and achieve their career goals through personalized guidance and intelligent recommendations.

---

## Developer

Kishan Deshpande

## Project Name

Margadarshak AI

## Tagline

Your AI Career Mentor
