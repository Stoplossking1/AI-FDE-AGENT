import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { FileCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function CodeViewer({ file, darkMode }) {
  if (!file) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <FileCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Select a file to view its contents
          </p>
        </div>
      </Card>
    );
  }

  // Determine language from file extension
  const getLanguage = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      json: 'json',
      py: 'python',
      css: 'css',
      html: 'html',
      md: 'markdown',
      yml: 'yaml',
      yaml: 'yaml',
    };
    return languageMap[ext] || 'plaintext';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileCode className="h-4 w-4" />
          {file.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <Editor
          height="100%"
          language={getLanguage(file.name)}
          value={file.content || '// No content available'}
          theme={darkMode ? 'vs-dark' : 'light'}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
          }}
        />
      </CardContent>
    </Card>
  );
}

