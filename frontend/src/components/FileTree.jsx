import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react';
import { cn } from '@/lib/utils';

function FileTreeNode({ node, depth = 0, expandedFolders, onToggleFolder, onSelectFile, selectedFile }) {
  const isExpanded = expandedFolders.has(node.name);
  const isSelected = selectedFile?.name === node.name;

  const handleClick = () => {
    if (node.type === 'folder') {
      onToggleFolder(node.name);
    } else {
      onSelectFile(node);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-blue-600/10 transition-all text-sm",
          isSelected && "bg-gradient-to-r from-orange-500/15 to-blue-600/10 border-l-2 border-orange-500"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === 'folder' ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-orange-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <Folder className="h-4 w-4 text-orange-500" />
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="h-4 w-4 text-blue-600" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>
      
      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTreeNode
              key={`${child.name}-${index}`}
              node={child}
              depth={depth + 1}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ projectStructure, onFileSelect, selectedFile }) {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['sales-dashboard', 'frontend', 'backend', 'src']));

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderName)) {
        newSet.delete(folderName);
      } else {
        newSet.add(folderName);
      }
      return newSet;
    });
  };

  if (!projectStructure || projectStructure.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        No project structure available
      </div>
    );
  }

  return (
    <div className="py-2">
      {projectStructure.map((node, index) => (
        <FileTreeNode
          key={`${node.name}-${index}`}
          node={node}
          expandedFolders={expandedFolders}
          onToggleFolder={toggleFolder}
          onSelectFile={onFileSelect}
          selectedFile={selectedFile}
        />
      ))}
    </div>
  );
}

