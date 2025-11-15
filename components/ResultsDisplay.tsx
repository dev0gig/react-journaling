
import React from 'react';
import { MarkdownFile } from '../types';
import { DownloadIcon } from './icons';

interface ResultsDisplayProps {
  files: MarkdownFile[];
}

const downloadFile = (file: MarkdownFile) => {
    const blob = new Blob([file.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ files }) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <ul className="divide-y divide-border">
      {files.map((file, index) => (
        <li key={index} className="px-4 py-3 flex justify-between items-center transition-colors duration-200 hover:bg-border/30">
          <span className="font-mono text-sm text-secondary truncate mr-2" title={file.filename}>{file.filename}</span>
          <button
            onClick={() => downloadFile(file)}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-accent bg-accent/10 border border-accent/20 rounded-md transition-colors duration-200 hover:bg-accent/20"
            aria-label={`Download ${file.filename}`}
          >
            <DownloadIcon className="w-4 h-4" />
            Download
          </button>
        </li>
      ))}
    </ul>
  );
};