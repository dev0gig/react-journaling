import React from 'react';

interface LogseqPreviewProps {
  content: string;
}

const renderLine = (line: string, index: number) => {
    if (!line.trim()) return null;

    const indentationMatch = line.match(/^(\s*)/);
    const indentationLevel = indentationMatch ? Math.floor(indentationMatch[1].length / 2) : 0;
    
    const content = line.trim();
    let textContent = content.startsWith('- ') ? content.substring(2) : content;

    const isTodo = textContent.toLowerCase().startsWith('todo ');
    if (isTodo) {
        textContent = textContent.substring(5).trim();
    }

    // Regex to split by tags but keep them
    const parts = textContent.split(/(#\S+)/g);

    return (
        <div key={index} className="relative flex items-start group text-sm my-1" style={{ paddingLeft: `${indentationLevel * 1.5}rem` }}>
            {/* Indentation guide line */}
            {indentationLevel > 0 && (
                <div 
                    className="absolute top-0 h-full w-px bg-border/50 group-hover:bg-accent/50 transition-colors" 
                    style={{ left: `${(indentationLevel * 1.5) - 0.75}rem` }}>
                </div>
            )}

            <div className="absolute top-[7px] w-1.5 h-1.5 rounded-full bg-secondary group-hover:bg-accent transition-colors"></div>
            
            <div className="pl-4 leading-relaxed">
                {isTodo && (
                    <span className="inline-block px-1.5 py-0.5 mr-2 text-xs font-bold text-yellow-900 bg-yellow-400 rounded">TODO</span>
                )}
                {parts.map((part, i) => {
                    if (part.match(/^#\S+$/)) {
                        return <span key={i} className="text-accent bg-accent/10 px-1 py-0.5 rounded-sm mx-0.5 cursor-pointer hover:bg-accent/20">{part}</span>;
                    }
                    return <span key={i}>{part}</span>;
                })}
            </div>
        </div>
    );
};

export const LogseqPreview: React.FC<LogseqPreviewProps> = ({ content }) => {
    const lines = content.split('\n');
    return (
        <div className="font-sans">
            {lines.map(renderLine)}
        </div>
    );
};
