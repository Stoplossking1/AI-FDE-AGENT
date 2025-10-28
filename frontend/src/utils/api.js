// Mock API calls with simulated delays

export const uploadAudio = async (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transcript: `Customer: "We need a dashboard to track our sales metrics in real-time. It should show revenue, conversion rates, and top products. We want it to be mobile-responsive and have dark mode support."
        
Engineer: "Got it. Any specific tech stack preferences?"

Customer: "We're comfortable with React. Can you also add authentication so only our team can access it?"

Engineer: "Absolutely. I'll include user authentication, real-time charts, and make it fully responsive with dark mode."`,
        audioId: `audio_${Date.now()}`,
      });
    }, 2000);
  });
};

export const runMVPGeneration = async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        mvpId: `mvp_${Date.now()}`,
        features: [
          "Real-time sales dashboard with charts",
          "User authentication (login/logout)",
          "Revenue and conversion rate metrics",
          "Top products display",
          "Mobile-responsive design",
          "Dark mode toggle",
          "REST API endpoints for data fetching",
          "Database schema for sales data",
        ],
        steps: [
          {
            agent: "Planner",
            status: "completed",
            description: "Analyzed requirements and created project structure",
          },
          {
            agent: "Coder",
            status: "completed",
            description: "Generated React frontend and Node.js backend",
          },
          {
            agent: "Tester",
            status: "completed",
            description: "Created unit tests and integration tests",
          },
          {
            agent: "Deployer",
            status: "pending",
            description: "Ready to deploy to production",
          },
        ],
        projectStructure: [
          {
            name: "sales-dashboard",
            type: "folder",
            children: [
              {
                name: "frontend",
                type: "folder",
                children: [
                  {
                    name: "src",
                    type: "folder",
                    children: [
                      {
                        name: "App.jsx",
                        type: "file",
                        content: `import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard 
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onLogout={() => setIsAuthenticated(false)}
        />
      ) : (
        <Login onLogin={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
}

export default App;`,
                      },
                      {
                        name: "components",
                        type: "folder",
                        children: [
                          {
                            name: "Dashboard.jsx",
                            type: "file",
                            content: `import { useState, useEffect } from 'react';
import RevenueChart from './RevenueChart';
import MetricsCard from './MetricsCard';
import TopProducts from './TopProducts';

export default function Dashboard({ darkMode, setDarkMode, onLogout }) {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Fetch dashboard metrics
    fetch('/api/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data));
  }, []);

  return (
    <div className="dashboard">
      <header>
        <h1>Sales Dashboard</h1>
        <button onClick={() => setDarkMode(!darkMode)}>
          Toggle Dark Mode
        </button>
        <button onClick={onLogout}>Logout</button>
      </header>
      
      <div className="metrics-grid">
        <MetricsCard title="Revenue" value={metrics?.revenue} />
        <MetricsCard title="Conversion Rate" value={metrics?.conversionRate} />
      </div>
      
      <RevenueChart data={metrics?.chartData} />
      <TopProducts products={metrics?.topProducts} />
    </div>
  );
}`,
                          },
                          {
                            name: "Login.jsx",
                            type: "file",
                            content: `import { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock authentication
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}`,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    name: "package.json",
                    type: "file",
                    content: `{
  "name": "sales-dashboard",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.5.0"
  }
}`,
                  },
                ],
              },
              {
                name: "backend",
                type: "folder",
                children: [
                  {
                    name: "server.js",
                    type: "file",
                    content: `const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock metrics endpoint
app.get('/api/metrics', (req, res) => {
  res.json({
    revenue: '$125,430',
    conversionRate: '3.2%',
    chartData: [
      { date: '2024-01', revenue: 45000 },
      { date: '2024-02', revenue: 52000 },
      { date: '2024-03', revenue: 61000 },
    ],
    topProducts: [
      { name: 'Product A', sales: 1250 },
      { name: 'Product B', sales: 980 },
      { name: 'Product C', sales: 750 },
    ]
  });
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});`,
                  },
                  {
                    name: "package.json",
                    type: "file",
                    content: `{
  "name": "sales-dashboard-backend",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}`,
                  },
                ],
              },
              {
                name: "README.md",
                type: "file",
                content: `# Sales Dashboard MVP

A real-time sales dashboard with authentication and dark mode.

## Features
- Real-time metrics display
- User authentication
- Mobile-responsive design
- Dark mode support
- Revenue and conversion tracking
- Top products display

## Setup
\`\`\`bash
# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd backend && npm install

# Run both servers
npm run dev
\`\`\``,
              },
            ],
          },
        ],
      });
    }, 3000);
  });
};

export const deployMVP = async (mvpId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        deploymentUrl: "https://sales-dashboard-demo.vercel.app",
        logs: [
          "[2024-03-20 10:23:45] Starting deployment...",
          "[2024-03-20 10:23:46] Installing dependencies...",
          "[2024-03-20 10:23:52] Building frontend...",
          "[2024-03-20 10:24:01] Building backend...",
          "[2024-03-20 10:24:05] Running tests...",
          "[2024-03-20 10:24:12] All tests passed ✓",
          "[2024-03-20 10:24:13] Deploying to production...",
          "[2024-03-20 10:24:20] Deployment successful ✓",
          "[2024-03-20 10:24:21] Live at: https://sales-dashboard-demo.vercel.app",
        ],
      });
    }, 5000);
  });
};

