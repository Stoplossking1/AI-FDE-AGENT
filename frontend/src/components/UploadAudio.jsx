import { useState, useRef } from 'react';
import { Upload, FileAudio, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { uploadAudio } from '../utils/api';

export default function UploadAudio({ onTranscriptReady }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      handleFileUpload(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  const handleFileUpload = async (uploadedFile) => {
    setFile(uploadedFile);
    setIsUploading(true);
    
    try {
      const result = await uploadAudio(uploadedFile);
      setTranscript(result.transcript);
      onTranscriptReady(result);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="h-5 w-5" />
          Audio Upload
        </CardTitle>
        <CardDescription>
          Upload customer conversation audio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? 'border-blue-600 bg-gradient-to-br from-blue-500/10 to-blue-600/10 shadow-inner'
              : 'border-muted-foreground/25 hover:border-blue-600/50 hover:bg-blue-600/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground">Processing audio...</p>
            </div>
          ) : transcript ? (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 className="h-12 w-12 text-blue-600" />
              <p className="text-sm font-medium">Audio processed successfully!</p>
              <p className="text-xs text-muted-foreground">{file?.name}</p>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">
                Drag and drop audio file here
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                or click to browse
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Select File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          )}
        </div>

        {transcript && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
            <h4 className="text-sm font-semibold mb-2 text-blue-600 dark:text-blue-400">Transcript Preview:</h4>
            <p className="text-xs text-muted-foreground whitespace-pre-line">
              {transcript.substring(0, 200)}...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

