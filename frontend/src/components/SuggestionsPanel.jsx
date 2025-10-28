import { Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import SuggestionCard from './SuggestionCard';

export default function SuggestionsPanel({ suggestions, onApplySuggestion, onDismissSuggestion, applyingId }) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI Suggestions
          </CardTitle>
          <CardDescription>
            Proactive recommendations from your AI FDE
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 blur-2xl" />
              <Sparkles className="h-12 w-12 mx-auto relative text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold mb-2">No Suggestions Yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Generate an MVP first, and the AI will analyze your code to provide 
              proactive suggestions for improvements, refactoring, and optimization.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-background to-background/80 backdrop-blur-sm pb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI Suggestions
          </h3>
          <span className="text-xs text-muted-foreground">
            {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Your AI FDE has analyzed the code and found these opportunities for improvement
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-600 dark:text-blue-400">
          These suggestions are automatically generated based on best practices, performance patterns, 
          and security considerations. Review each before applying.
        </p>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onApply={onApplySuggestion}
            onDismiss={onDismissSuggestion}
            isApplying={applyingId === suggestion.id}
          />
        ))}
      </div>
    </div>
  );
}

