import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import UploadAudio from '../components/UploadAudio';
import ProjectContextForm from '../components/ProjectContextForm';
import SummaryPanel from '../components/SummaryPanel';
import FileTree from '../components/FileTree';
import CodeViewer from '../components/CodeViewer';
import DeployButton from '../components/DeployButton';
import LogsViewer from '../components/LogsViewer';
import AgentLoadingAnimation from '../components/AgentLoadingAnimation';
import SuggestionsPanel from '../components/SuggestionsPanel';
import IterationPanel from '../components/IterationPanel';
import MemoryTimeline from '../components/MemoryTimeline';

export default function Index() {
  const [isDark, setIsDark] = useDarkMode();
  const [audioTranscript, setAudioTranscript] = useState(null);
  const [mvpData, setMvpData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deploymentLogs, setDeploymentLogs] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingMvpData, setPendingMvpData] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [applyingSuggestionId, setApplyingSuggestionId] = useState(null);
  const [iterationHistory, setIterationHistory] = useState([]);
  const [isIterating, setIsIterating] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  const handleTranscriptReady = (data) => {
    setAudioTranscript(data);
    
    // Add to conversation history
    setConversationHistory(prev => [...prev, {
      id: `audio-${Date.now()}`,
      type: 'audio_uploaded',
      title: 'Customer conversation uploaded',
      description: `Processed audio transcript (${Math.floor(data.transcript?.length / 100 || 10)} seconds)`,
      timestamp: Date.now(),
      metadata: {}
    }]);
  };

  const handleMVPGenerationStart = () => {
    setIsGenerating(true);
    setPendingMvpData(null);
  };

  const handleMVPGenerated = (data) => {
    // Store the data but don't show it yet - wait for animation to complete
    setPendingMvpData(data);
  };

  const handleAnimationComplete = () => {
    // Animation finished, now show the generated MVP
    setIsGenerating(false);
    if (pendingMvpData) {
      setMvpData(pendingMvpData);
      // Auto-expand first file for preview
      if (pendingMvpData.projectStructure && pendingMvpData.projectStructure.length > 0) {
        const firstFile = findFirstFile(pendingMvpData.projectStructure[0]);
        if (firstFile) {
          setSelectedFile(firstFile);
        }
      }
      // Generate AI suggestions after MVP is complete
      generateAISuggestions(pendingMvpData);
      
      // Add to conversation history
      const fileCount = countFiles(pendingMvpData.projectStructure || []);
      setConversationHistory(prev => [...prev, {
        id: `mvp-${Date.now()}`,
        type: 'mvp_generated',
        title: 'MVP Generated Successfully',
        description: `Generated full-stack application with ${pendingMvpData.features?.length || 0} features`,
        timestamp: Date.now(),
        metadata: {
          features: pendingMvpData.features?.length || 0,
          fileCount: fileCount,
        }
      }]);
    }
  };

  const countFiles = (structure) => {
    let count = 0;
    const traverse = (nodes) => {
      nodes.forEach(node => {
        if (node.type === 'file') count++;
        if (node.children) traverse(node.children);
      });
    };
    traverse(structure);
    return count;
  };

  const generateAISuggestions = (mvpData) => {
    // Mock suggestions - in production, these would come from backend analysis
    const mockSuggestions = [
      {
        id: '1',
        type: 'performance',
        title: 'Implement code splitting for faster initial load',
        description: 'Your bundle size could be reduced by implementing route-based code splitting. This will improve initial load time by 40-50%.',
        impact: 'high',
        effort: 'medium',
        files: ['src/App.jsx', 'src/index.jsx'],
        preview: 'Use React.lazy() and Suspense for route components'
      },
      {
        id: '2',
        type: 'refactor',
        title: 'Convert class components to functional hooks',
        description: 'Found 2 class components that could be modernized using React hooks for better performance and maintainability.',
        impact: 'medium',
        effort: 'low',
        files: ['src/components/Dashboard.jsx', 'src/components/Header.jsx'],
      },
      {
        id: '3',
        type: 'security',
        title: 'Add input validation for user forms',
        description: 'User input fields should have proper validation and sanitization to prevent XSS attacks.',
        impact: 'high',
        effort: 'low',
        files: ['src/components/LoginForm.jsx', 'src/components/SignupForm.jsx'],
      },
      {
        id: '4',
        type: 'ux',
        title: 'Add loading states and error boundaries',
        description: 'Improve user experience by adding loading indicators and error boundaries for better error handling.',
        impact: 'medium',
        effort: 'low',
        files: ['src/App.jsx'],
        preview: '<ErrorBoundary>\n  <Suspense fallback={<Loading />}>\n    ...\n  </Suspense>\n</ErrorBoundary>'
      },
    ];

    setAiSuggestions(mockSuggestions);
  };

  const handleApplySuggestion = async (suggestion) => {
    setApplyingSuggestionId(suggestion.id);
    
    // Simulate applying the suggestion
    setTimeout(() => {
      // In production, this would call an API to apply the changes
      console.log('Applied suggestion:', suggestion);
      
      // Add to conversation history
      setConversationHistory(prev => [...prev, {
        id: `suggestion-${Date.now()}`,
        type: 'suggestion_applied',
        title: `Applied: ${suggestion.title}`,
        description: suggestion.description,
        timestamp: Date.now(),
        metadata: {
          fileCount: suggestion.files?.length || 0,
        }
      }]);
      
      // Remove the applied suggestion
      setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      setApplyingSuggestionId(null);
      
      // Could show a success notification here
    }, 2000);
  };

  const handleDismissSuggestion = (suggestionId) => {
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const findFirstFile = (node) => {
    if (node.type === 'file') return node;
    if (node.children) {
      for (const child of node.children) {
        const file = findFirstFile(child);
        if (file) return file;
      }
    }
    return null;
  };

  const handleDeployStart = () => {
    setIsDeploying(true);
    setDeploymentLogs([]);
  };

  const handleDeployComplete = (result) => {
    setIsDeploying(false);
    setDeploymentLogs(result.logs || []);
    if (result.deploymentUrl) {
      setDeploymentUrl(result.deploymentUrl);
      
      // Add to conversation history
      setConversationHistory(prev => [...prev, {
        id: `deploy-${Date.now()}`,
        type: 'deployed',
        title: 'Successfully Deployed',
        description: `MVP deployed to production at ${result.deploymentUrl}`,
        timestamp: Date.now(),
        metadata: {
          version: `v1.${iterationHistory.length}`,
        }
      }]);
    }
  };

  const handleIterationRequest = async (feedback) => {
    setIsIterating(true);
    
    // Simulate AI processing the iteration request
    setTimeout(() => {
      // In production, this would call the backend to:
      // 1. Analyze the feedback
      // 2. Run relevant agents (Planner, Coder)
      // 3. Generate updated code
      // 4. Re-deploy
      
      const mockChanges = ['src/App.jsx', 'src/components/Settings.jsx'];
      
      const iteration = {
        feedback,
        timestamp: Date.now(),
        changes: mockChanges,
      };
      
      setIterationHistory(prev => [...prev, iteration]);
      
      // Add to conversation history
      setConversationHistory(prev => [...prev, {
        id: `iteration-${Date.now()}`,
        type: 'iteration',
        title: `Iteration v1.${iterationHistory.length + 1}`,
        description: feedback,
        timestamp: Date.now(),
        metadata: {
          version: `v1.${iterationHistory.length + 1}`,
          fileCount: mockChanges.length,
        }
      }]);
      
      // Simulate updating the MVP data
      console.log('Iteration applied:', iteration);
      
      // Could trigger a mini animation showing the changes
      setIsIterating(false);
      
      // Could show a success notification
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <img src="/flash-white.png" alt="AI FDE" className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  AI FDE
                </h1>
                <p className="text-xs text-muted-foreground">
                  Forward Deployed Engineers
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              <Switch
                checked={isDark}
                onCheckedChange={setIsDark}
              />
              <Moon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* Left Panel - Inputs */}
          <div className="lg:col-span-4 space-y-4 overflow-auto">
            {/* Memory Timeline */}
            <MemoryTimeline 
              history={conversationHistory} 
              isCollapsible={true}
            />
            
            <UploadAudio onTranscriptReady={handleTranscriptReady} />
            
            <ProjectContextForm
              onMVPGenerated={handleMVPGenerated}
              onMVPGenerationStart={handleMVPGenerationStart}
              disabled={!audioTranscript}
            />

            {mvpData && (
              <div className="space-y-4">
                <DeployButton
                  mvpId={mvpData.mvpId}
                  onDeployStart={handleDeployStart}
                  onDeployComplete={handleDeployComplete}
                  disabled={!mvpData}
                />
                
                {/* Show iteration panel after deployment */}
                {deploymentUrl && (
                  <IterationPanel
                    mvpData={mvpData}
                    onIterationRequest={handleIterationRequest}
                    isIterating={isIterating}
                    iterationHistory={iterationHistory}
                  />
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Workspace */}
          <div className="lg:col-span-8 overflow-hidden">
            <Tabs defaultValue="code" className="h-full flex flex-col">
              <TabsList className="w-full justify-start bg-card/50 backdrop-blur-sm">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="suggestions" className="relative">
                  Suggestions
                  {aiSuggestions.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-blue-600 text-white">
                      {aiSuggestions.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="flex-1 mt-4">
                {isGenerating ? (
                  <AgentLoadingAnimation onComplete={handleAnimationComplete} />
                ) : mvpData ? (
                  <div className="grid grid-cols-12 gap-4 h-full">
                    <div className="col-span-4 border rounded-lg overflow-auto bg-card/80 backdrop-blur-sm shadow-sm">
                      <div className="p-3 border-b bg-gradient-to-r from-blue-500/10 to-blue-600/10">
                        <h3 className="text-sm font-semibold">Project Files</h3>
                      </div>
                      <FileTree
                        projectStructure={mvpData.projectStructure}
                        onFileSelect={setSelectedFile}
                        selectedFile={selectedFile}
                      />
                    </div>
                    <div className="col-span-8 overflow-hidden">
                      <CodeViewer file={selectedFile} darkMode={isDark} />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center border rounded-lg bg-card/80 backdrop-blur-sm shadow-sm">
                    <div className="text-center p-8">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 blur-2xl" />
                        <img src={isDark ? "/flash-white.png" : "/flash-black.png"} alt="AI FDE" className="h-16 w-16 mx-auto relative" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Ready to Generate Your MVP
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Upload a customer conversation audio file and fill in the
                        project context to generate a full MVP codebase.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="summary" className="flex-1 mt-4 overflow-auto">
                <SummaryPanel mvpData={mvpData} />
              </TabsContent>

              <TabsContent value="suggestions" className="flex-1 mt-4 overflow-auto">
                <SuggestionsPanel
                  suggestions={aiSuggestions}
                  onApplySuggestion={handleApplySuggestion}
                  onDismissSuggestion={handleDismissSuggestion}
                  applyingId={applyingSuggestionId}
                />
              </TabsContent>

              <TabsContent value="logs" className="flex-1 mt-4 overflow-auto">
                <LogsViewer logs={deploymentLogs} isActive={isDeploying} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

