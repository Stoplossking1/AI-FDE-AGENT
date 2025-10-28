# AI FDE - AI Copilot for Forward Deployed Engineers

An AI-powered platform that generates full-stack MVP codebases from customer conversation audio files. Built with React, FastAPI, and powered by advanced AI agents.

## 🚀 Overview

AI FDE helps forward deployed engineers rapidly prototype and deploy MVPs by:
- Analyzing customer conversation recordings
- Extracting requirements and technical preferences
- Generating complete codebases with multiple AI agents
- Providing one-click deployment capabilities

## 🎯 Key Features

- **🎙️ Audio Processing**: Upload customer conversation audio files for automatic transcription and analysis
- **🤖 AI Agent Pipeline**: 
  - **The Orchestrator**: Analyzes conversations and extracts requirements
  - **The Coder**: Generates complete codebase with file creation animations
  - **The Tester**: Creates and runs comprehensive tests
  - **The Guardian**: Performs security audits and penetration testing
  - **The Deployer**: Handles deployment configuration and hosting
- **📊 Intelligent Context**: Capture customer company, persona, goals, and tech stack preferences
- **🌳 Code Explorer**: Browse generated project structure with interactive file tree
- **💻 Code Viewer**: Syntax-highlighted Monaco Editor for viewing generated code
- **🚀 One-Click Deploy**: Deploy MVPs with real-time deployment logs
- **🌙 Dark Mode**: Beautiful light and dark themes with persistent preferences

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible components
- **Monaco Editor** - VS Code editor in browser
- **Lucide React** - Icon library
- **Radix UI** - Headless UI primitives

### Backend
- **FastAPI** - High-performance Python web framework
- **Python 3.x** - Backend language
- **AI/ML Integration** - Claude API for intelligent agents

## 📁 Project Structure

```
CalHack/
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # shadcn/ui base components
│   │   │   ├── AgentLoadingAnimation.jsx
│   │   │   ├── FileCreationAnimation.jsx
│   │   │   ├── UploadAudio.jsx
│   │   │   ├── ProjectContextForm.jsx
│   │   │   ├── SummaryPanel.jsx
│   │   │   ├── FileTree.jsx
│   │   │   ├── CodeViewer.jsx
│   │   │   └── DeployButton.jsx
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   └── lib/              # Library code
│   ├── public/               # Static assets
│   └── package.json
│
├── backend/                   # FastAPI backend
│   ├── agents/               # AI agent implementations
│   ├── core/                 # Core backend logic
│   ├── routes/               # API routes
│   ├── main.py              # Application entry point
│   └── requirements.txt     # Python dependencies
│
├── .gitignore
└── README.md                 # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/kartikeybihani/AI-FDE.git
cd CalHack
```

2. **Setup Frontend**
```bash
cd frontend
npm install
```

3. **Setup Backend**
```bash
cd ../backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

4. **Configure Environment Variables**

Create a `.env` file in the `backend/` folder:
```env
# Add your API keys and configuration
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL=your_database_url_here
```

---

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uvicorn main:app --reload
```

Backend will be available at `http://localhost:8000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## 🎯 Usage Workflow

1. **Upload Audio**: Drag and drop a customer conversation audio file
2. **Fill Context Form**: Provide customer details (company, persona, goals, tech stack)
3. **Generate MVP**: Click "Generate MVP" and watch the AI agents work:
   - The Orchestrator analyzes the conversation
   - The Coder generates the complete codebase with live file creation
   - The Tester creates comprehensive tests
   - The Guardian performs security audits
   - The Deployer prepares deployment configuration
4. **Explore Generated Code**: Browse the file tree and view code
5. **Deploy**: One-click deployment with real-time logs

---

## 🎨 Design Philosophy

- **Clean & Minimal**: Focus on functionality without clutter
- **Modern Developer Experience**: Inspired by Vercel, Replit, and Figma
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode First**: Beautiful themes for extended coding sessions
- **Real-time Feedback**: Live updates and animations throughout

---

## 🔌 API Integration

The frontend communicates with the backend through REST APIs:

- `POST /api/audio/upload` - Upload and process audio files
- `POST /api/mvp/generate` - Generate MVP codebase
- `POST /api/deploy` - Deploy generated MVP
- `GET /api/projects/:id` - Retrieve project details

---

## 🧪 Development

### Frontend Development

```bash
cd frontend

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Add new shadcn/ui component
npx shadcn-ui@latest add [component-name]
```

### Backend Development

```bash
cd backend

# Run with hot reload
uvicorn main:app --reload

# Run tests
pytest

# Update dependencies
pip freeze > requirements.txt
```

---

## 🚢 Deployment

### Frontend Deployment

```bash
cd frontend
npm run build
# Deploy the dist/ folder to Vercel, Netlify, or your hosting provider
```

### Backend Deployment

Deploy using Docker, Heroku, AWS, or your preferred platform. Ensure environment variables are properly configured.

---

## 🐛 Troubleshooting

### Frontend Issues
- **Clear cache**: `rm -rf node_modules/.vite && npm install`
- **Port conflict**: Change port in `vite.config.js`

### Backend Issues
- **Dependencies**: Ensure virtual environment is activated
- **Python version**: Verify Python 3.8+ is installed
- **API keys**: Check `.env` file configuration

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Built for CalHacks 2025

Created as part of the "AI Copilot for Forward Deployed Engineers" hackathon project.

**Team**: Forward Deployed Engineers  
**Hackathon**: CalHacks 2025  
**Goal**: Revolutionize how engineers build MVPs from customer conversations

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ⚡ by the AI FDE Team**
