import { useState } from 'react';

export function useFileTree(initialTree = []) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const toggleFolder = (path) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const selectFile = (file) => {
    if (file.type === 'file') {
      setSelectedFile(file);
    }
  };

  return {
    selectedFile,
    expandedFolders,
    toggleFolder,
    selectFile,
  };
}

