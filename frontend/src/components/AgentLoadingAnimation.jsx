import { useState, useEffect } from 'react';
import { Lightbulb, Code, Bug, Shield, Rocket } from 'lucide-react';
import FileCreationAnimation from './FileCreationAnimation';

// Mock file structure to animate during code generation
const mockFilesToCreate = [
  { name: 'package.json', type: 'file', delay: 0 },
  { name: 'src/', type: 'folder', delay: 300 },
  { name: 'src/App.jsx', type: 'file', delay: 500 },
  { name: 'src/index.jsx', type: 'file', delay: 700 },
  { name: 'src/components/', type: 'folder', delay: 900 },
  { name: 'src/components/Header.jsx', type: 'file', delay: 1100 },
  { name: 'src/components/Dashboard.jsx', type: 'file', delay: 1300 },
  { name: 'src/utils/', type: 'folder', delay: 1500 },
  { name: 'src/utils/api.js', type: 'file', delay: 1700 },
  { name: 'src/styles/', type: 'folder', delay: 1900 },
  { name: 'src/styles/index.css', type: 'file', delay: 2100 },
  { name: 'public/', type: 'folder', delay: 2300 },
  { name: 'public/index.html', type: 'file', delay: 2500 },
  { name: '.gitignore', type: 'file', delay: 2700 },
  { name: 'README.md', type: 'file', delay: 2900 },
];

const agents = [
  {
    name: 'The Orchestrator',
    icon: Lightbulb,
    description: 'Analyzes your customer conversation in real-time, extracting preferences, pain points, and technical constraints to build a personalized product roadmap',
    tasks: [
      'Identifying customer preferences and friction points from conversation...',
      'Mapping requirements to your existing tech stack and capabilities...',
      'Generating tailored recommendations to align features with customer needs...',
      'Creating context-aware implementation strategy based on discussion insights...',
    ],
    timing: {
      typingSpeed: 15,
      descriptionPause: 2000,
      taskPause: 2500,
      betweenAgentsPause: 1200,
    },
  },
  {
    name: 'The Coder',
    icon: Code,
    description: 'Converts specs into code — instantly. Whether it\'s backend APIs, database schemas, or React components',
    tasks: [
      'Generating backend APIs...',
      'Creating database schemas...',
      'Building React components...',
      'Setting up routing...',
    ],
    timing: {
      typingSpeed: 15,
      descriptionPause: 1200,
      taskPause: 1600,
      betweenAgentsPause: 1200,
    },
  },
  {
    name: 'The Tester',
    icon: Bug,
    description: 'Generates and runs tests. Catches bugs early, ensures edge cases are handled, and validates logic',
    tasks: [
      'Writing unit tests...',
      'Testing edge cases...',
      'Validating API endpoints...',
      'Running test suite...',
    ],
    timing: {
      typingSpeed: 15,
      descriptionPause: 1000,
      taskPause: 1200,
      betweenAgentsPause: 1200,
    },
  },
  {
    name: 'The Guardian',
    icon: Shield,
    description: 'Reviews the MVP for vulnerabilities, insecure patterns, and data handling issues',
    tasks: [
      'Scanning for vulnerabilities...',
      'Checking authentication...',
      'Validating data handling...',
      'Running penetration tests on critical endpoints...',
    ],
    timing: {
      typingSpeed: 15,
      descriptionPause: 1000,
      taskPause: 1200,
      betweenAgentsPause: 1200,
    },
  },
  {
    name: 'The Deployer',
    icon: Rocket,
    description: 'Pushes your MVP live with a single command. It handles deployment configs, environments, and hosting',
    tasks: [
      'Configuring deployment...',
      'Setting up environment...',
      'Optimizing build...',
      'Preparing hosting...',
    ],
    timing: {
      typingSpeed: 15,
      descriptionPause: 1500,
      taskPause: 1800,
      betweenAgentsPause: 0,
    },
  },
];

export default function AgentLoadingAnimation({ onComplete }) {
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [phase, setPhase] = useState('description'); // 'description' or 'tasks'
  const [completedAgents, setCompletedAgents] = useState([]);
  const [isWaitingBetweenAgents, setIsWaitingBetweenAgents] = useState(false);
  
  // File creation animation state
  const [createdFiles, setCreatedFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(-1);
  const [showFileAnimation, setShowFileAnimation] = useState(false);

  const currentAgent = agents[currentAgentIndex];
  const currentTask = currentAgent?.tasks[currentTaskIndex] || '';
  const targetText = phase === 'description' ? currentAgent.description : currentTask;

  // Typewriter effect
  useEffect(() => {
    if (isWaitingBetweenAgents) {
      const timeout = setTimeout(() => {
        setIsWaitingBetweenAgents(false);
        setCurrentAgentIndex(prev => prev + 1);
        setCurrentTaskIndex(0);
        setPhase('description');
        setDisplayedText('');
      }, currentAgent.timing.betweenAgentsPause); // Pause between agents (agent-specific)
      return () => clearTimeout(timeout);
    }

    if (displayedText.length < targetText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(targetText.slice(0, displayedText.length + 1));
      }, currentAgent.timing.typingSpeed); // Typing speed (agent-specific)
      return () => clearTimeout(timeout);
    } else if (displayedText.length === targetText.length && targetText.length > 0) {
      // Finished typing current text
      if (phase === 'description') {
        // Move to tasks after description
        const timeout = setTimeout(() => {
          setPhase('tasks');
          setDisplayedText('');
        }, currentAgent.timing.descriptionPause); // Pause after description (agent-specific)
        return () => clearTimeout(timeout);
      } else {
        // Move to next task or agent
        const timeout = setTimeout(() => {
          if (currentTaskIndex < currentAgent.tasks.length - 1) {
            // More tasks in current agent
            setCurrentTaskIndex(prev => prev + 1);
            setDisplayedText('');
          } else {
            // Agent completed
            setCompletedAgents(prev => [...prev, currentAgentIndex]);
            
            if (currentAgentIndex < agents.length - 1) {
              // More agents to show - trigger waiting state
              setIsWaitingBetweenAgents(true);
            } else {
              // All agents completed - call onComplete after a short delay
              setTimeout(() => {
                onComplete?.();
              }, 1500);
            }
          }
        }, currentAgent.timing.taskPause); // Pause after task (agent-specific)
        return () => clearTimeout(timeout);
      }
    }
  }, [displayedText, targetText, phase, currentTaskIndex, currentAgentIndex, currentAgent, isWaitingBetweenAgents, onComplete]);

  // File creation animation effect (runs during Coder agent)
  useEffect(() => {
    // Only show file animation during Coder agent (index 1) and tasks phase
    if (currentAgentIndex === 1 && phase === 'tasks') {
      if (!showFileAnimation) {
        setShowFileAnimation(true);
        setCurrentFileIndex(0);
      }
      
      // Animate files being created one by one
      if (currentFileIndex >= 0 && currentFileIndex < mockFilesToCreate.length) {
        const currentFile = mockFilesToCreate[currentFileIndex];
        const timeout = setTimeout(() => {
          setCreatedFiles(prev => [...prev, currentFile]);
          if (currentFileIndex < mockFilesToCreate.length - 1) {
            setCurrentFileIndex(prev => prev + 1);
          }
        }, currentFile.delay || 300);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [currentAgentIndex, phase, currentFileIndex, showFileAnimation]);

  // Reset file animation when moving to next agent
  useEffect(() => {
    if (currentAgentIndex !== 1) {
      setShowFileAnimation(false);
      setCreatedFiles([]);
      setCurrentFileIndex(-1);
    }
  }, [currentAgentIndex]);

  const IconComponent = currentAgent.icon;
  const isCoderAgent = currentAgentIndex === 1;
  const currentlyCreatingFile = showFileAnimation && currentFileIndex >= 0 && currentFileIndex < mockFilesToCreate.length 
    ? mockFilesToCreate[currentFileIndex] 
    : null;

  return (
    <div className="h-full flex items-center justify-center border rounded-lg bg-card/80 backdrop-blur-sm shadow-sm">
      <div className={`text-center p-8 ${isCoderAgent && showFileAnimation ? 'max-w-6xl' : 'max-w-2xl'}`}>
        {/* Show split view for Coder agent during tasks phase */}
        {isCoderAgent && phase === 'tasks' && showFileAnimation ? (
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Agent Status */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 blur-2xl" />
                <div className="relative flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg animate-pulse">
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-3 text-blue-600 dark:text-blue-400">
                {currentAgent.name}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-6">
                {currentAgent.description}
              </p>
              
              <div className="space-y-2">
                {currentAgent.tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className={`text-sm px-4 py-2 rounded-lg transition-all duration-300 ${
                      idx < currentTaskIndex
                        ? 'text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20'
                        : idx === currentTaskIndex
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 font-medium border border-blue-500/20'
                        : 'text-muted-foreground/50 bg-muted/30'
                    }`}
                  >
                    {idx < currentTaskIndex && <span className="mr-2">✓</span>}
                    {idx === currentTaskIndex ? (
                      <>
                        {displayedText}
                        <span className="animate-pulse ml-0.5">|</span>
                      </>
                    ) : (
                      task
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: File Creation Animation */}
            <div className="border rounded-lg p-4 bg-muted/30 text-left max-h-[500px] overflow-auto">
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 sticky top-0 bg-muted/50 backdrop-blur-sm pb-2">
                <Code className="h-4 w-4 text-blue-600" />
                Creating Project Files...
                <span className="ml-auto text-xs text-muted-foreground">
                  {createdFiles.length}/{mockFilesToCreate.length}
                </span>
              </h4>
              <div className="space-y-1">
                {createdFiles.map((file, idx) => (
                  <FileCreationAnimation
                    key={idx}
                    fileName={file.name}
                    type={file.type}
                    status="created"
                  />
                ))}
                {currentlyCreatingFile && (
                  <FileCreationAnimation
                    fileName={currentlyCreatingFile.name}
                    type={currentlyCreatingFile.type}
                    status="creating"
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          // Default single-column view for other agents
          <>
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 blur-2xl" />
              <div className="relative flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg animate-pulse">
                  <IconComponent className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-3 text-blue-600 dark:text-blue-400">
              {currentAgent.name}
            </h3>
            
            {phase === 'description' ? (
              <p className="text-sm text-muted-foreground mb-6 min-h-[40px]">
                {displayedText}
                <span className="animate-pulse ml-0.5">|</span>
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  {currentAgent.description}
                </p>
                <div className="space-y-2">
                  {currentAgent.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className={`text-sm px-4 py-2 rounded-lg transition-all duration-300 ${
                        idx < currentTaskIndex
                          ? 'text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20'
                          : idx === currentTaskIndex
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 font-medium border border-blue-500/20'
                          : 'text-muted-foreground/50 bg-muted/30'
                      }`}
                    >
                      {idx < currentTaskIndex && <span className="mr-2">✓</span>}
                      {idx === currentTaskIndex ? (
                        <>
                          {displayedText}
                          <span className="animate-pulse ml-0.5">|</span>
                        </>
                      ) : (
                        task
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
        
        {/* Progress indicator */}
        <div className="mt-8 flex justify-center gap-2">
          {agents.map((agent, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  completedAgents.includes(idx)
                    ? 'w-10 bg-green-500'
                    : idx === currentAgentIndex
                    ? 'w-12 bg-blue-600 animate-pulse'
                    : 'w-8 bg-muted'
                }`}
              />
              {idx === currentAgentIndex && (
                <span className="text-xs text-muted-foreground">{agent.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

