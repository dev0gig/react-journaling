import React from 'react';
import { MarkdownFile } from '../types';
import { LogseqPreview } from './LogseqPreview';

interface PreviewContainerProps {
  files: MarkdownFile[];
  errors: string[];
}

export const PreviewContainer: React.FC<PreviewContainerProps> = ({ files, errors }) => {
  const hasContent = files.length > 0 || errors.length > 0;

  return (
    <div className="w-full h-full bg-surface-light border border-border rounded-lg p-4 overflow-auto" aria-live="polite">
      {!hasContent ? (
        <div className="flex items-center justify-center h-full">
            <p className="text-secondary text-center text-sm">Vorschau wird hier angezeigt...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {errors.length > 0 && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm" role="alert">
              <h3 className="font-bold mb-2">Verarbeitungsfehler</h3>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {files.map((file, index) => (
            <div key={index} role="article" aria-labelledby={`file-heading-${index}`}>
              <div className="pb-2 mb-2 border-b border-border/50">
                <p id={`file-heading-${index}`} className="font-mono text-xs text-accent">{file.filename}</p>
              </div>
              <LogseqPreview content={file.content} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};