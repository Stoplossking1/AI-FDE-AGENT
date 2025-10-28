import { Loader2, CheckCircle2, File, Folder } from 'lucide-react';

export default function FileCreationAnimation({ fileName, status, type = 'file' }) {
  const isCreating = status === 'creating';
  const Icon = type === 'folder' ? Folder : File;
  
  return (
    <div 
      className={`flex items-center gap-2 py-1.5 px-3 rounded-md transition-all duration-300 ${
        isCreating 
          ? 'animate-pulse bg-blue-500/10 border border-blue-500/30' 
          : 'bg-green-500/10 border border-green-500/30 animate-in fade-in slide-in-from-left-2'
      }`}
    >
      {isCreating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
      )}
      
      <Icon className={`h-3.5 w-3.5 ${
        isCreating ? 'text-blue-600' : 'text-green-600'
      }`} />
      
      <span className={`text-xs font-mono flex-1 ${
        isCreating ? 'text-blue-600 font-medium' : 'text-green-600'
      }`}>
        {fileName}
      </span>
      
      {isCreating && (
        <span className="text-xs text-muted-foreground animate-pulse">
          Writing...
        </span>
      )}
    </div>
  );
}

