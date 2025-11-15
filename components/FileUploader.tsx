import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';

interface FileUploaderProps {
  onFileSelect: (files: FileList) => void;
  disabled: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className={`
          flex flex-col items-center justify-center w-full h-48 px-4 
          border-2 border-dashed rounded-lg cursor-pointer
          bg-surface border-border
          transition-colors duration-300
          ${isDragging ? 'border-accent bg-accent/10' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-secondary'}
        `}
      >
        <div 
          className="flex flex-col items-center justify-center pt-5 pb-6 text-center"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <UploadIcon className="w-10 h-10 mb-3 text-secondary" />
          <p className="mb-2 text-sm text-secondary">
            <span className="font-semibold text-accent">Klicken zum Hochladen</span> oder Dateien hierher ziehen
          </p>
          <p className="text-xs text-secondary">Nur .txt-Dateien</p>
        </div>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          accept=".txt"
          onChange={handleChange} 
          disabled={disabled} 
          multiple
        />
      </label>
    </div>
  );
};