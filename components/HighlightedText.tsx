
import React from 'react';

export const HighlightedText: React.FC<{ text: string; highlight?: string; selection?: string }> = ({ text, highlight, selection }) => {
    if (!highlight?.trim() && !selection?.trim()) {
        return <>{text}</>;
    }

    // Escape special characters for regex
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const searchRegex = highlight ? new RegExp(`(${escapeRegex(highlight)})`, 'gi') : null;
    const parts = searchRegex ? text.split(searchRegex) : [text];

    return (
        <>
            {parts.map((part, i) => {
                // Part is a search highlight
                if (searchRegex && part.toLowerCase() === highlight?.toLowerCase()) {
                    return (
                        <span key={i} className="bg-accent text-background px-0.5 rounded-sm">
                            {part}
                        </span>
                    );
                }

                // Part is not a search highlight, so check for selection highlight
                if (!selection?.trim()) {
                    return part; // No selection to highlight, return plain text
                }
                
                const selectionRegex = new RegExp(`(${escapeRegex(selection)})`, 'g');
                const selectionParts = part.split(selectionRegex);

                return selectionParts.map((selPart, j) =>
                    selPart.toLowerCase() === selection.toLowerCase() ? (
                        <span key={`${i}-${j}`} className="bg-accent-sky/40 rounded-sm">
                            {selPart}
                        </span>
                    ) : (
                        selPart
                    )
                );
            })}
        </>
    );
};
