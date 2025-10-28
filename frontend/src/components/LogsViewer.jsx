import { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function LogsViewer({ logs, isActive }) {
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isActive && (!logs || logs.length === 0)) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Deployment Logs
          </CardTitle>
          <CardDescription>
            Deploy your MVP to see logs here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-neutral-900 via-blue-950/30 to-neutral-950 text-blue-300 rounded-lg p-4 font-mono text-xs min-h-[200px] flex items-center justify-center border border-blue-900/30">
            <p className="text-muted-foreground">Waiting for deployment...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Deployment Logs
        </CardTitle>
        <CardDescription>
          Real-time deployment progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-br from-neutral-900 via-blue-950/30 to-neutral-950 text-blue-300 rounded-lg p-4 font-mono text-xs min-h-[200px] max-h-[400px] overflow-auto border border-blue-900/30">
          {logs?.map((log, index) => (
            <div key={index} className="mb-1 hover:text-orange-300 transition-colors">
              {log}
            </div>
          ))}
          {isActive && (
            <div className="flex items-center gap-1 mt-2">
              <span className="animate-pulse text-orange-500">▊</span>
            </div>
          )}
          <div ref={logsEndRef} />
        </div>
      </CardContent>
    </Card>
  );
}

