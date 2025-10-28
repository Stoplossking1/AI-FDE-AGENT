import { useState } from 'react';
import { History, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import TimelineEvent from './TimelineEvent';

export default function MemoryTimeline({ history, onEventClick, isCollapsible = true }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-4 w-4 text-blue-600" />
            Memory & Context
          </CardTitle>
          <CardDescription className="text-xs">
            AI remembers your entire project journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Your project timeline will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-blue-600" />
              Memory & Context
            </CardTitle>
            <CardDescription className="text-xs">
              {history.length} event{history.length !== 1 ? 's' : ''} tracked
            </CardDescription>
          </div>
          {isCollapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {/* Timeline Info Banner */}
          <div className="mb-4 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              🧠 The AI tracks all your interactions to provide context-aware suggestions
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-0 max-h-[400px] overflow-auto pr-2">
            {history.map((event, idx) => (
              <TimelineEvent
                key={event.id || idx}
                event={event}
                isFirst={idx === 0}
                isLast={idx === history.length - 1}
                onClick={onEventClick ? () => onEventClick(event) : undefined}
              />
            ))}
          </div>

          {/* Stats Footer */}
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-xs font-semibold text-blue-600">
                {history.filter(e => e.type === 'mvp_generated').length}
              </div>
              <div className="text-xs text-muted-foreground">Generated</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-xs font-semibold text-green-600">
                {history.filter(e => e.type === 'deployed').length}
              </div>
              <div className="text-xs text-muted-foreground">Deployed</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-xs font-semibold text-cyan-600">
                {history.filter(e => e.type === 'iteration').length}
              </div>
              <div className="text-xs text-muted-foreground">Iterations</div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

