
import React from 'react';
import { Anecdote } from '../types';
import { EditIcon } from './icons';
import { MarkdownPreview } from './MarkdownPreview';
import ErrorBoundary from './ErrorBoundary';

interface AnecdoteEntryProps {
    anecdote: Anecdote;
    onEdit: (id: string) => void;
    searchQuery?: string;
}

export const AnecdoteEntry: React.FC<AnecdoteEntryProps> = ({ anecdote, onEdit, searchQuery }) => {
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
            <ErrorBoundary key={anecdote.id}>
                <MarkdownPreview content={anecdote.text} highlightTerm={searchQuery} />
            </ErrorBoundary>
        </div>
      </article>
    );
  };