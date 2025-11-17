
import React, { useState, useEffect, useRef } from 'react';
import { Anecdote } from '../types';
import { MarkdownPreview } from './MarkdownPreview';
import ErrorBoundary from './ErrorBoundary';
import { CloseIcon } from './icons';
import { formatDateHeading } from '../utils/helpers';

interface EditModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    anecdoteToEdit?: Anecdote | null;
    onSave: (anecdote: Anecdote) => void;
    onClose: () => void;
}

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const EditModal: React.FC<EditModalProps> = ({ isOpen, mode, anecdoteToEdit, onSave, onClose }) => {
    const [text, setText] = useState('');
    const [date, setDate] = useState(getTodayDateString());
    const [selectedText, setSelectedText] = useState('');

    const editorRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && anecdoteToEdit) {
                setText(anecdoteToEdit.text);
                setDate(anecdoteToEdit.date);
            } else {
                setText('');
                setDate(getTodayDateString());
            }
            setSelectedText('');
        }
    }, [isOpen, mode, anecdoteToEdit]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

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
    }, [isOpen]);


    if (!isOpen) return null;

    const handleSaveClick = () => {
        if (!text.trim()) {
            alert('Der Eintrag darf nicht leer sein.');
            return;
        }
        
        if (mode === 'create') {
            onSave({
                id: `entry-${Date.now()}-${Math.random()}`,
                date: date,
                text: text,
            });
        } else if (anecdoteToEdit) {
            onSave({
                ...anecdoteToEdit,
                text: text,
            });
        }
    };
    
    const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        const selection = target.value.substring(target.selectionStart, target.selectionEnd);
        setSelectedText(selection);
    };

    const title = mode === 'create' ? 'Neuer Eintrag' : 'Eintrag bearbeiten';

    return (
        <div 
            className="fixed inset-0 bg-surface z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
        >
            {/* Header */}
            <header className="flex justify-between items-center p-4 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-4">
                    <h2 id="edit-modal-title" className="text-lg font-bold text-primary">
                        {title}
                    </h2>
                     {mode === 'create' ? (
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-surface-light border border-border rounded-md px-2 py-1 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    ) : (
                        <span className="text-secondary font-normal">{formatDateHeading(date)}</span>
                    )}
                </div>
                <button onClick={onClose} className="text-secondary hover:text-primary transition-colors" aria-label="Editor schließen">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </header>

            {/* Content */}
            <main className="flex-grow p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                {/* Editor Pane */}
                <div className="flex flex-col h-full">
                    <label htmlFor="modal-editor" className="block text-sm font-medium text-secondary mb-2">
                        Editor
                    </label>
                    <textarea
                        id="modal-editor"
                        ref={editorRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onSelect={handleSelect}
                        className="w-full flex-grow bg-surface-light border border-border rounded-md px-3 py-2 text-secondary placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent resize-none font-mono"
                        aria-label="Text bearbeiten"
                        placeholder="Beginne zu schreiben..."
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
                        <ErrorBoundary resetKey={text}>
                            <MarkdownPreview content={text} selectionHighlight={selectedText} />
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