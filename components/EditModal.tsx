
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

    // Effect for synchronized scrolling
    useEffect(() => {
        const editor = editorRef.current;
        const preview = previewRef.current;
        if (!editor || !preview) return;

        let ignoreNextScrollEventFor: HTMLElement | null = null;

        const onScroll = (scrolledElement: HTMLElement, targetElement: HTMLElement) => {
            if (ignoreNextScrollEventFor === scrolledElement) {
                ignoreNextScrollEventFor = null;
                return;
            }

            const sourceScrollTop = scrolledElement.scrollTop;
            const sourceScrollHeight = scrolledElement.scrollHeight - scrolledElement.clientHeight;
            if (sourceScrollHeight <= 0) return;

            const scrollPercentage = sourceScrollTop / sourceScrollHeight;
            const targetScrollHeight = targetElement.scrollHeight - targetElement.clientHeight;

            const targetScrollTop = scrollPercentage * targetScrollHeight;

            ignoreNextScrollEventFor = targetElement;
            targetElement.scrollTop = targetScrollTop;
        };

        const handleEditorScroll = () => onScroll(editor, preview);
        const handlePreviewScroll = () => onScroll(preview, editor);

        editor.addEventListener('scroll', handleEditorScroll);
        preview.addEventListener('scroll', handlePreviewScroll);

        return () => {
            editor.removeEventListener('scroll', handleEditorScroll);
            preview.removeEventListener('scroll', handlePreviewScroll);
        };
    }, [anecdote]);


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

    return (
        <div 
            className="fixed inset-0 bg-surface z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
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
    );
};
