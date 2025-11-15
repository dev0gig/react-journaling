
import React, { useState, useCallback } from 'react';
import { BowIcon, AddCircleIcon } from './icons';
import { FileUploader } from './FileUploader';
import { PreviewContainer } from './PreviewContainer';
import { ResultsDisplay } from './ResultsDisplay';
import { processMoleskineTxt } from '../services/fileProcessor';
import { MarkdownFile, ProcessingResult, Anecdote } from '../types';

export const MoleskineConverter = ({ onBack, onAddToJournal }: { onBack: () => void; onAddToJournal: (entries: Anecdote[]) => void; }) => {
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback(async (fileList: FileList) => {
    setIsProcessing(true);
    setFiles([]);
    setErrors([]);
    
    let allFiles: MarkdownFile[] = [];
    let allErrors: string[] = [];

    for (const file of Array.from(fileList)) {
        if (file.type === 'text/plain') {
            try {
                const textContent = await file.text();
                const result: ProcessingResult = processMoleskineTxt(textContent);
                allFiles = [...allFiles, ...result.files];
                allErrors = [...allErrors, ...result.errors.map(e => `[${file.name}] ${e}`)];
            } catch (error) {
                allErrors.push(`Fehler beim Lesen der Datei "${file.name}"`);
            }
        } else {
            allErrors.push(`Die Datei "${file.name}" ist keine .txt-Datei und wurde übersprungen.`);
        }
    }

    setFiles(allFiles);
    setErrors(allErrors);
    setIsProcessing(false);
  }, []);

  const handleAddToJournal = () => {
    const newEntries: Anecdote[] = files.map((file, index) => {
        const date = file.filename.replace('.md', '');

        return {
            id: `imported-${Date.now()}-${index}`,
            date: date,
            text: file.content,
        };
    });
    onAddToJournal(newEntries);
  };

  return (
    <div className="min-h-screen bg-background text-primary font-sans p-6 sm:p-8 lg:p-12">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <BowIcon className="w-10 h-10 text-accent" />
            <div>
                <h1 className="text-2xl font-bold text-primary">Moleskine zu Logseq Konverter</h1>
                <p className="text-secondary">Laden Sie Ihre Moleskine Studio .txt-Exporte hoch, um sie zu konvertieren.</p>
            </div>
        </div>
        <button 
            onClick={onBack} 
            className="px-4 py-2 rounded-md text-sm font-semibold text-primary bg-surface-light hover:bg-border transition-colors">
            Zurück zum Journal
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{height: 'calc(100vh - 120px)'}}>
        <div className="flex flex-col gap-6 overflow-y-auto pb-4">
            <div className="bg-surface p-6 rounded-2xl">
                <h2 className="text-lg font-bold mb-4">1. Datei hochladen</h2>
                <FileUploader onFileSelect={handleFileSelect} disabled={isProcessing} />
            </div>
            
            {isProcessing && (
                <div className="bg-surface p-6 rounded-2xl flex items-center justify-center">
                    <p className="text-secondary animate-pulse">Verarbeitung...</p>
                </div>
            )}
            
            {files.length > 0 && !isProcessing && (
                 <div className="bg-surface p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-4">2. Ergebnisse</h2>
                    <p className="text-sm text-secondary mb-4">
                        {files.length} {files.length === 1 ? 'Datei wurde' : 'Dateien wurden'} erfolgreich erstellt.
                    </p>
                    <div className="flex flex-col gap-4 mb-4">
                        <button
                            onClick={handleAddToJournal}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-background bg-accent-green rounded-md transition-colors duration-200 hover:opacity-90"
                        >
                            <AddCircleIcon className="text-base" />
                            <span>Alle zum Journal hinzufügen</span>
                        </button>
                        <p className="text-xs text-secondary text-center -my-2">Oder einzeln herunterladen:</p>
                    </div>
                    <div className="bg-surface-light rounded-lg max-h-80 overflow-y-auto">
                        <ResultsDisplay files={files} />
                    </div>
                </div>
            )}
        </div>

        <div className="bg-surface p-6 rounded-2xl flex flex-col">
            <h2 className="text-lg font-bold mb-4">Vorschau</h2>
            <div className="flex-grow overflow-hidden">
                <PreviewContainer files={files} errors={errors} />
            </div>
        </div>
      </main>
    </div>
  );
};
