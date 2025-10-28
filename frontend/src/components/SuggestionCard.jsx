import { Lightbulb, TrendingUp, Zap, Shield, CheckCircle2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const suggestionTypeConfig = {
  refactor: {
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  performance: {
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  ux: {
    icon: Lightbulb,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  security: {
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
};

export default function SuggestionCard({ suggestion, onApply, onDismiss, isApplying }) {
  const config = suggestionTypeConfig[suggestion.type] || suggestionTypeConfig.ux;
  const IconComponent = config.icon;

  const impactColors = {
    high: 'text-red-600 bg-red-500/10 border-red-500/30',
    medium: 'text-orange-600 bg-orange-500/10 border-orange-500/30',
    low: 'text-green-600 bg-green-500/10 border-green-500/30',
  };

  const effortColors = {
    high: 'text-red-600',
    medium: 'text-orange-600',
    low: 'text-green-600',
  };

  return (
    <Card className={`border-2 ${config.borderColor} hover:shadow-lg transition-all`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <IconComponent className={`h-5 w-5 ${config.color}`} />
            </div>
            <div>
              <CardTitle className="text-base">{suggestion.title}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)} Suggestion
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(suggestion.id)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{suggestion.description}</p>

        {/* Impact & Effort Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`px-2 py-1 rounded-md text-xs font-medium border ${impactColors[suggestion.impact]}`}>
            Impact: {suggestion.impact}
          </div>
          <div className={`px-2 py-1 rounded-md text-xs font-medium border ${effortColors[suggestion.effort]}`}>
            Effort: {suggestion.effort}
          </div>
        </div>

        {/* Affected Files */}
        {suggestion.files && suggestion.files.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Affected Files:</p>
            <div className="flex flex-wrap gap-1">
              {suggestion.files.map((file, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded bg-muted font-mono"
                >
                  {file}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preview (if available) */}
        {suggestion.preview && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Preview:</p>
            <div className="text-xs p-2 rounded bg-muted font-mono whitespace-pre-wrap max-h-24 overflow-auto">
              {suggestion.preview}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onApply(suggestion)}
            disabled={isApplying}
            className="flex-1"
            size="sm"
          >
            {isApplying ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Apply Suggestion
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDismiss(suggestion.id)}
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

