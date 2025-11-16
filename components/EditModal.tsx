
import React, { useState, useEffect, useRef } from 'react';
import { Anecdote } from '../types';
import { MarkdownPreview } from './MarkdownPreview';
import ErrorBoundary from './ErrorBoundary';
import { CloseIcon } from './icons';
import { formatDateHeading } from '../utils/helpers';

interface EditModalProps {
    anecdote: Anecdote | null;
    onSave: (anecdote: Anecdote) => void;
    onClose: () => void;
}

export const EditModal: React.FC<EditModalProps> = ({ anecdote, onSave, onClose }) => {
    const [editedText, setEditedText] = useState('');
    const [selectedText, setSelectedText] = useState('');

    const editorRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const activePane = useRef<'editor' | 'preview' | null>(null);

    useEffect(() => {
        if (anecdote) {
            setEditedText(anecdote.text);
        }
        setSelectedText('');
    }, [anecdote]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (anecdote) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [anecdote, onClose]);

    if (!anecdote) return null;

    const handleSaveClick = () => {
        onSave({
            ...anecdote,
            text: editedText,
        });
    };
    
    const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        const selection = target.value.substring(target.selectionStart, target.selectionEnd);
        setSelectedText(selection);
    };

    const handleScroll = (scrolledPane: 'editor' | 'preview') => {
        if (activePane.current !== scrolledPane) return;
        
        const sourceEl = scrolledPane === 'editor' ? editorRef.current : previewRef.current;
        const targetEl = scrolledPane === 'editor' ? previewRef.current : editorRef.current;
        
        if (!sourceEl || !targetEl) return;
        
        const sourceScrollTop = sourceEl.scrollTop;
        const sourceScrollHeight = sourceEl.scrollHeight - sourceEl.clientHeight;
        
        if (sourceScrollHeight <= 0) return;
        
        const scrollPercentage = sourceScrollTop / sourceScrollHeight;
        const targetScrollHeight = targetEl.scrollHeight - targetEl.clientHeight;
        
        targetEl.scrollTop = scrollPercentage * targetScrollHeight;
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
        >
            <div 
                className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex justify-between items-center p-4 border-b border-border flex-shrink-0">
                    <h2 id="edit-modal-title" className="text-lg font-bold text-primary">
                        Eintrag bearbeiten - <span className="text-secondary font-normal">{formatDateHeading(anecdote.date)}</span>
                    </h2>
                    <button onClick={onClose} className="text-secondary hover:text-primary transition-colors" aria-label="Editor schließen">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                {/* Content */}
                <main className="flex-grow p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                    {/* Editor Pane */}
                    <div className="flex flex-col h-full">
                        <label htmlFor={`modal-editor-${anecdote.id}`} className="block text-sm font-medium text-secondary mb-2">
                            Editor
                        </label>
                        <textarea
                            id={`modal-editor-${anecdote.id}`}
                            ref={editorRef}
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            onSelect={handleSelect}
                            onScroll={() => handleScroll('editor')}
                            onMouseEnter={() => activePane.current = 'editor'}
                            className="w-full flex-grow bg-surface-light border border-border rounded-md px-3 py-2 text-secondary placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent resize-none font-mono"
                            aria-label="Text bearbeiten"
                        />
                    </div>
                    {/* Preview Pane */}
                    <div className="flex flex-col h-full">
                        <label className="block text-sm font-medium text-secondary mb-2">
                            Vorschau
                        </label>
                        <div 
                            ref={previewRef}
                            onScroll={() => handleScroll('preview')}
                            onMouseEnter={() => activePane.current = 'preview'}
                            className="w-full flex-grow bg-surface-light border border-border rounded-md p-3 overflow-y-auto"
                        >
                            <ErrorBoundary key={editedText}>
                                <MarkdownPreview content={editedText} selectionHighlight={selectedText} />
                            </ErrorBoundary>
                        </div>
                    </div>
                </main>
                
                {/* Footer */}
                <footer className="flex justify-end gap-2 p-4 border-t border-border flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-semibold text-primary bg-surface-light hover:bg-border transition-colors">Abbrechen</button>
                    <button onClick={handleSaveClick} className="px-4 py-2 rounded-md text-sm font-semibold bg-accent text-background hover:opacity-90 transition-opacity">Speichern</button>
                </footer>
            </div>
        </div>
    );
};
