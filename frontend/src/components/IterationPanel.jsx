import { useState } from 'react';
import { RefreshCw, Send, History, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

export default function IterationPanel({ 
  mvpData, 
  onIterationRequest, 
  isIterating, 
  iterationHistory = [] 
}) {
  const [feedback, setFeedback] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (feedback.trim()) {
      onIterationRequest(feedback);
      setFeedback('');
    }
  };

  const currentVersion = `v1.${iterationHistory.length}`;

  return (
    <Card className="border-2 border-blue-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Continue Improving
            </CardTitle>
            <CardDescription>
              Iterate on your MVP with AI assistance
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-1 rounded bg-blue-500/10 text-blue-600 border border-blue-500/30">
              {currentVersion}
            </span>
            {iterationHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Iteration History */}
        {showHistory && iterationHistory.length > 0 && (
          <div className="space-y-2 pb-4 border-b">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <History className="h-4 w-4" />
              Iteration History
            </h4>
            <div className="space-y-2 max-h-48 overflow-auto">
              {iterationHistory.map((iteration, idx) => (
                <div
                  key={idx}
                  className="text-xs p-3 rounded-lg bg-muted border flex items-start gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">v1.{idx + 1}</span>
                      <span className="text-muted-foreground">
                        {new Date(iteration.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{iteration.feedback}</p>
                    {iteration.changes && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {iteration.changes.map((change, cidx) => (
                          <span
                            key={cidx}
                            className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-mono"
                          >
                            {change}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="iteration-feedback" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              What would you like to improve?
            </Label>
            <Textarea
              id="iteration-feedback"
              placeholder="E.g., Add dark mode toggle to settings, Optimize the dashboard loading time, Add user authentication..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isIterating}
              className="min-h-[100px]"
            />
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Add authentication',
                'Improve UI/UX',
                'Optimize performance',
                'Add new feature',
                'Fix responsive design',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setFeedback(suggestion)}
                  disabled={isIterating}
                  className="text-xs px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!feedback.trim() || isIterating}
          >
            {isIterating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                AI is working on improvements...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Apply Improvements
              </>
            )}
          </Button>
        </form>

        {/* Info Banner */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            💡 The AI will analyze your feedback, make the necessary code changes, 
            and automatically re-deploy your updated MVP. You can iterate as many times as needed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

