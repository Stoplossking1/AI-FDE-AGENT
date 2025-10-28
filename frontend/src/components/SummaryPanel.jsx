import { CheckCircle2, Circle, Loader2, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function SummaryPanel({ mvpData }) {
  if (!mvpData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            MVP Summary
          </CardTitle>
          <CardDescription>
            Generate an MVP to see the summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Upload audio and fill the form to generate your MVP
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          MVP Summary
        </CardTitle>
        <CardDescription>
          AI-generated features and implementation plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Features Section */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-orange-600" />
            Extracted Features
          </h4>
          <ul className="space-y-2">
            {mvpData.features?.map((feature, index) => (
              <li
                key={index}
                className="text-sm flex items-start gap-2 p-2 rounded-md hover:bg-gradient-to-r hover:from-orange-500/5 hover:to-blue-600/5 transition-all"
              >
                <span className="text-orange-600 mt-0.5 font-bold">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Agent Steps Section */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Agent Progress</h4>
          <div className="space-y-3">
            {mvpData.steps?.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border bg-gradient-to-r from-card via-orange-500/5 to-blue-600/5 hover:shadow-md transition-all"
              >
                <div className="mt-0.5">
                  {step.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  ) : step.status === 'in_progress' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{step.agent}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

