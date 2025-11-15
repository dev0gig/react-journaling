
import React from 'react';

export const HighlightedText: React.FC<{ text: string; highlight?: string }> = ({ text, highlight }) => {
    if (!highlight?.trim()) {
        return <>{text}</>;
    }
    // Escape special characters for regex
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <span key={i} className="bg-accent text-background px-0.5 rounded-sm">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </>
    );
};
