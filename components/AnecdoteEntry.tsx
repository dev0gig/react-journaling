
import React, { useState, useEffect } from 'react';
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
  
    useEffect(() => {
      setEditedText(anecdote.text);
    }, [anecdote, isEditing]);
  
    const handleSaveClick = () => {
      onSave({
        ...anecdote,
        text: editedText,
      });
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
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full bg-surface-light border border-border rounded-md px-3 py-2 text-secondary placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent h-96 resize-y font-mono"
                aria-label="Text bearbeiten"
              />
            </div>
            {/* Right Column: Preview */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Vorschau
              </label>
              <div className="w-full bg-surface-light border border-border rounded-md p-3 h-96 overflow-y-auto">
                <MarkdownPreview content={editedText} />
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