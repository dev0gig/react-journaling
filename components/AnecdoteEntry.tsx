
import React, { useState, useEffect, useRef } from 'react';
import { Anecdote } from '../types';
import { EditIcon } from './icons';
import { MarkdownPreview } from './MarkdownPreview';

interface AnecdoteEntryProps {
    anecdote: Anecdote;
    isEditing: boolean;
    onEdit: (id: string) => void;
    onSave: (anecdote: Anecdote) => void;
    onCancel: () => void;
    searchQuery?: string;
}

export const AnecdoteEntry: React.FC<AnecdoteEntryProps> = ({ anecdote, isEditing, onEdit, onSave, onCancel, searchQuery }) => {
    const [editedText, setEditedText] = useState(anecdote.text);
    const [selectedText, setSelectedText] = useState('');

    const editorRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const activePane = useRef<'editor' | 'preview' | null>(null);
  
    useEffect(() => {
      setEditedText(anecdote.text);
      setSelectedText(''); // Reset selection when anecdote changes or editing starts
    }, [anecdote, isEditing]);
  
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
        // Only sync if the scrolled pane is the one the user is interacting with
        if (activePane.current !== scrolledPane) {
            return;
        }
        
        const sourceEl = scrolledPane === 'editor' ? editorRef.current : previewRef.current;
        const targetEl = scrolledPane === 'editor' ? previewRef.current : editorRef.current;
        
        if (!sourceEl || !targetEl) return;
        
        const sourceScrollTop = sourceEl.scrollTop;
        const sourceScrollHeight = sourceEl.scrollHeight - sourceEl.clientHeight;
        
        // Avoid division by zero
        if (sourceScrollHeight <= 0) return;
        
        const scrollPercentage = sourceScrollTop / sourceScrollHeight;
        
        const targetScrollHeight = targetEl.scrollHeight - targetEl.clientHeight;
        
        targetEl.scrollTop = scrollPercentage * targetScrollHeight;
    };
  
    if (isEditing) {
      return (
        <article className="bg-surface p-4 rounded-xl shadow-md ring-2 ring-accent">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Editor */}
            <div>
              <label htmlFor={`editor-${anecdote.id}`} className="block text-sm font-medium text-secondary mb-2">
                Editor
              </label>
              <textarea
                id={`editor-${anecdote.id}`}
                ref={editorRef}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onSelect={handleSelect}
                onScroll={() => handleScroll('editor')}
                onMouseEnter={() => activePane.current = 'editor'}
                className="w-full bg-surface-light border border-border rounded-md px-3 py-2 text-secondary placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent h-96 resize-y font-mono"
                aria-label="Text bearbeiten"
              />
            </div>
            {/* Right Column: Preview */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Vorschau
              </label>
              <div 
                ref={previewRef}
                onScroll={() => handleScroll('preview')}
                onMouseEnter={() => activePane.current = 'preview'}
                className="w-full bg-surface-light border border-border rounded-md p-3 h-96 overflow-y-auto"
              >
                <MarkdownPreview content={editedText} selectionHighlight={selectedText} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-semibold text-primary bg-surface-light hover:bg-border transition-colors">Abbrechen</button>
            <button onClick={handleSaveClick} className="px-4 py-2 rounded-md text-sm font-semibold bg-accent text-background hover:opacity-90 transition-opacity">Speichern</button>
          </div>
        </article>
      );
    }
  
    return (
      <article className="bg-surface-light p-4 rounded-xl shadow-md relative">
        <button
          onClick={() => onEdit(anecdote.id)}
          className="absolute top-3 right-3 p-1.5 rounded-full text-secondary transition-colors hover:text-primary"
          aria-label="Eintrag bearbeiten"
        >
          <EditIcon className="w-4 h-4" />
        </button>
        <div className="pr-8">
            <MarkdownPreview content={anecdote.text} highlightTerm={searchQuery} />
        </div>
      </article>
    );
  };
