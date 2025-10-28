# AI Copilot for Forward Deployed Engineers - Frontend

A modern, responsive frontend application built with React, TailwindCSS, and shadcn/ui for generating MVP codebases from customer conversations.

## 🚀 Features

- **Audio Upload**: Drag-and-drop or click to upload customer conversation audio files
- **Intelligent Context Form**: Capture customer company, persona, goals, and tech stack preferences
- **MVP Summary**: View extracted features and AI agent progress (Planner → Coder → Tester → Deployer)
- **Code Explorer**: Browse generated project structure with collapsible file tree
- **Code Viewer**: Syntax-highlighted code display powered by Monaco Editor
- **One-Click Deploy**: Deploy generated MVPs with real-time deployment logs
- **Dark Mode**: Toggle between light and dark themes

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Monaco Editor** - VS Code's code editor in the browser
- **Lucide React** - Beautiful icon library
- **Radix UI** - Headless UI primitives

## 📦 Installation

```bash
# Install dependencies
npm install
```

## 🏃 Running the App

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## 🎯 Usage Flow

1. **Upload Audio**: Drag and drop or select an audio file of a customer conversation
2. **Fill Context Form**: Provide customer company, persona, project goals, and preferred tech stack
3. **Generate MVP**: Click "Generate MVP" to process the input and create a full codebase
4. **Explore Code**: Browse the generated project structure and view file contents
5. **Deploy**: Click "Deploy to Production" to deploy the MVP and view real-time logs

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── UploadAudio.jsx
│   │   ├── ProjectContextForm.jsx
│   │   ├── SummaryPanel.jsx
│   │   ├── FileTree.jsx
│   │   ├── CodeViewer.jsx
│   │   ├── DeployButton.jsx
│   │   └── LogsViewer.jsx
│   ├── pages/              # Route pages
│   │   └── index.jsx       # Main page
│   ├── hooks/              # Custom React hooks
│   │   ├── useDarkMode.js
│   │   └── useFileTree.js
│   ├── utils/              # Utility functions
│   │   └── api.js          # Mock API calls
│   ├── lib/                # Library code
│   │   └── utils.js        # Helper utilities
│   ├── App.jsx             # App component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── index.html              # HTML template
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Design Philosophy

The UI is inspired by modern developer tools like Vercel, Replit, and Figma:

- Clean, minimal interface focused on functionality
- Smooth transitions and interactions
- Responsive design that works on all screen sizes
- Dark mode support for comfortable extended use
- Clear visual hierarchy and information density

## 🔌 API Integration

Currently, the app uses mock API calls with simulated delays. To connect to your backend:

1. Update the API endpoints in `src/utils/api.js`
2. Replace the mock implementations with actual fetch calls
3. Configure CORS settings on your backend

Example:

```javascript
export const uploadAudio = async (file) => {
  const formData = new FormData();
  formData.append("audio", file);

  const response = await fetch("http://your-backend/api/audio", {
    method: "POST",
    body: formData,
  });

  return response.json();
};
```

## 🧪 Mock Data

The app includes rich mock data to demonstrate functionality:

- Sample audio transcripts
- Example project structures
- Realistic deployment logs
- Agent progress tracking

## 🎭 Components Overview

### UploadAudio

- Drag-and-drop file upload
- File validation
- Loading states
- Transcript preview

### ProjectContextForm

- Customer company input
- Persona specification
- Project goals textarea
- Tech stack dropdown
- Form validation

### SummaryPanel

- Extracted features list
- Agent progress tracker
- Real-time status updates

### FileTree

- Collapsible folder structure
- File selection
- Visual hierarchy

### CodeViewer

- Syntax highlighting
- Multiple language support
- Read-only editor
- Dark mode support

### DeployButton & LogsViewer

- One-click deployment
- Terminal-style logs
- Real-time updates
- Deployment URL display

## 🌙 Dark Mode

Dark mode is automatically saved to localStorage and persists across sessions. Toggle using the switch in the header.

## 📱 Responsive Design

The app is fully responsive and works seamlessly on:

- Desktop (optimized for 1920x1080+)
- Tablet (768px+)
- Mobile (320px+)

## 🚧 Future Enhancements

- Real backend API integration
- User authentication
- Project history
- Export functionality
- Real-time collaboration
- Voice recording support
- AI chat interface

## 📄 License

MIT

## 👨‍💻 Built for CalHacks 2025

Created as part of the "AI Copilot for Forward Deployed Engineers" hackathon project.
