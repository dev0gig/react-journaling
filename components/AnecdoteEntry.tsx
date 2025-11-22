
import React, { memo } from 'react';
import { Anecdote } from '../types';
import { EditIcon } from './icons';
import { MarkdownPreview } from './MarkdownPreview';
import ErrorBoundary from './ErrorBoundary';

interface AnecdoteEntryProps {
  anecdote: Anecdote;
  onEdit: (anecdote: Anecdote) => void;
  onUpdate: (anecdote: Anecdote) => void;
  searchQuery?: string;
}

export const AnecdoteEntry: React.FC<AnecdoteEntryProps> = memo(({ anecdote, onEdit, onUpdate, searchQuery }) => {

  const handleContentChange = (newContent: string) => {
    onUpdate({ ...anecdote, text: newContent });
  };

  return (
    <article id={anecdote.id} className="bg-surface-light p-4 rounded-xl shadow-md relative">
      <button
        onClick={() => onEdit(anecdote)}
        className="absolute top-3 right-3 p-1.5 rounded-full text-secondary transition-colors hover:text-primary z-10"
        aria-label="Eintrag bearbeiten"
      >
        <EditIcon className="w-4 h-4" />
      </button>
      <div className="pr-8">
        <ErrorBoundary resetKey={anecdote.text}>
          <MarkdownPreview
            content={anecdote.text}
            highlightTerm={searchQuery}
            onContentChange={handleContentChange}
          />
        </ErrorBoundary>
      </div>
    </article>
  );
});

AnecdoteEntry.displayName = 'AnecdoteEntry';
