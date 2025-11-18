import React, { useMemo } from 'react';
import { Anecdote } from '../types';
import { ChecklistIcon, CloseIcon } from './icons';
import { formatDateHeading } from '../utils/helpers';

interface TodoViewProps {
    anecdotes: Anecdote[];
    onUpdate: (anecdote: Anecdote) => void;
    onBack: () => void;
}

interface TodoItem {
    id: string; // Composite ID for React key
    anecdoteId: string;
    date: string;
    lineIndex: number;
    text: string;
    isCompleted: boolean;
    prefix: string; // e.g. "- - "
    marker: string; // "TODO", "DONE", "[ ]", "[x]"
}

export const TodoView: React.FC<TodoViewProps> = ({ anecdotes, onUpdate, onBack }) => {

    // Extract all tasks from all anecdotes
    const allTodos = useMemo(() => {
        const todos: TodoItem[] = [];

        anecdotes.forEach(anecdote => {
            const lines = anecdote.text.split('\n');
            lines.forEach((line, index) => {
                // Regex matches:
                // Group 1: Indentation/bullets (e.g. "  - ", "- - ")
                // Group 2: Marker (TODO, DONE, [ ], [x])
                // Group 3: Task text
                const match = line.match(/^(\s*(?:(?:-\s+)|(?:\d+\.\s+))*)(TODO|DONE|\[[ xX]\])\s+(.*)/i);
                
                if (match) {
                    const prefix = match[1];
                    const marker = match[2];
                    const text = match[3];
                    const upperMarker = marker.toUpperCase();
                    
                    const isCompleted = upperMarker === 'DONE' || marker.includes('x') || marker.includes('X');

                    todos.push({
                        id: `${anecdote.id}-${index}`,
                        anecdoteId: anecdote.id,
                        date: anecdote.date,
                        lineIndex: index,
                        text,
                        isCompleted,
                        prefix,
                        marker
                    });
                }
            });
        });

        // Sort by date (newest first), then by line index
        return todos.sort((a, b) => {
            const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateDiff !== 0) return dateDiff;
            return a.lineIndex - b.lineIndex;
        });
    }, [anecdotes]);

    const handleToggle = (todo: TodoItem) => {
        const anecdote = anecdotes.find(a => a.id === todo.anecdoteId);
        if (!anecdote) return;

        const lines = anecdote.text.split('\n');
        if (lines.length <= todo.lineIndex) return;

        const line = lines[todo.lineIndex];
        
        // Reconstruct the line with swapped status
        let newLine = line;
        const upperMarker = todo.marker.toUpperCase();

        if (upperMarker === 'TODO') {
            newLine = line.replace(/TODO/i, 'DONE');
        } else if (upperMarker === 'DONE') {
            newLine = line.replace(/DONE/i, 'TODO');
        } else if (todo.marker.includes('[')) {
            const isChecked = todo.marker.toLowerCase().includes('x');
            const newBox = isChecked ? '[ ]' : '[x]';
            // Replace only the first occurrence of the box to avoid messing up text content
            newLine = line.replace(/\[[ xX]\]/, newBox);
        }

        lines[todo.lineIndex] = newLine;
        onUpdate({ ...anecdote, text: lines.join('\n') });
    };

    const groupedTodos = useMemo(() => {
        const groups: Record<string, TodoItem[]> = {};
        allTodos.forEach(todo => {
            if (!groups[todo.date]) groups[todo.date] = [];
            groups[todo.date].push(todo);
        });
        return groups;
    }, [allTodos]);

    return (
        <div className="bg-background min-h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-peach/20 rounded-full">
                        <ChecklistIcon className="w-6 h-6 text-accent-peach" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-primary">Meine Aufgaben</h2>
                        <p className="text-secondary text-sm">
                            {allTodos.filter(t => !t.isCompleted).length} offen, {allTodos.filter(t => t.isCompleted).length} erledigt
                        </p>
                    </div>
                </div>
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-surface-light rounded-md hover:bg-border transition-colors"
                >
                    <CloseIcon className="w-5 h-5" />
                    <span>Schließen</span>
                </button>
            </div>

            {Object.keys(groupedTodos).length === 0 ? (
                <div className="text-center py-12 bg-surface-light rounded-2xl">
                    <ChecklistIcon className="w-16 h-16 text-secondary/30 mx-auto mb-4" />
                    <p className="text-secondary">Keine Aufgaben gefunden.</p>
                    <p className="text-xs text-secondary/70 mt-2">
                        Verwenden Sie "TODO", "DONE" oder "- [ ]" in Ihren Einträgen.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.keys(groupedTodos).map(date => (
                        <div key={date}>
                            <h3 className="text-lg font-semibold text-primary mb-3 sticky top-0 bg-background/95 backdrop-blur py-2 border-b border-border/50 z-10">
                                {formatDateHeading(date)}
                            </h3>
                            <div className="bg-surface-light rounded-xl overflow-hidden shadow-sm border border-border/50">
                                {groupedTodos[date].map(todo => (
                                    <div 
                                        key={todo.id}
                                        className={`
                                            group flex items-start gap-3 p-3 border-b border-border/50 last:border-0 transition-colors hover:bg-surface
                                            ${todo.isCompleted ? 'bg-surface/30' : ''}
                                        `}
                                    >
                                        <button
                                            onClick={() => handleToggle(todo)}
                                            className={`
                                                mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all duration-200
                                                ${todo.isCompleted 
                                                    ? 'bg-accent border-accent text-background' 
                                                    : 'border-secondary hover:border-accent'
                                                }
                                            `}
                                        >
                                            {todo.isCompleted && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                                        </button>
                                        <div className={`flex-grow break-words ${todo.isCompleted ? 'text-secondary line-through' : 'text-primary'}`}>
                                            {todo.text}
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-secondary px-2 py-1 bg-surface rounded">
                                            {todo.isCompleted ? 'Erledigt' : 'Offen'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};