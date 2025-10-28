import { FileAudio, Code, Rocket, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

const eventTypeConfig = {
  audio_uploaded: {
    icon: FileAudio,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  mvp_generated: {
    icon: Code,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  deployed: {
    icon: Rocket,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  suggestion_applied: {
    icon: Sparkles,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  iteration: {
    icon: RefreshCw,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
};

export default function TimelineEvent({ event, isFirst, isLast, onClick }) {
  const config = eventTypeConfig[event.type] || eventTypeConfig.mvp_generated;
  const IconComponent = config.icon;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-5 top-11 bottom-0 w-0.5 bg-gradient-to-b from-border to-transparent" />
      )}

      {/* Event card */}
      <div
        className={`relative flex items-start gap-3 pb-4 ${
          onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
        }`}
        onClick={onClick}
      >
        {/* Icon */}
        <div className={`relative flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} border ${config.borderColor} flex items-center justify-center shadow-sm`}>
          <IconComponent className={`h-5 w-5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold truncate">{event.title}</h4>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTime(event.timestamp)}
            </span>
          </div>
          
          {event.description && (
            <p className="text-xs text-muted-foreground mb-2">
              {event.description}
            </p>
          )}

          {/* Metadata badges */}
          {event.metadata && (
            <div className="flex flex-wrap gap-1 mt-2">
              {event.metadata.features && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  {event.metadata.features} features
                </span>
              )}
              {event.metadata.fileCount && (
                <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-600 border border-green-500/20">
                  {event.metadata.fileCount} files
                </span>
              )}
              {event.metadata.version && (
                <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20 font-mono">
                  {event.metadata.version}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

