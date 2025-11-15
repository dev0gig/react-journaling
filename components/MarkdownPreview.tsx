import React from 'react';
import { HighlightedText } from './HighlightedText';

/**
 * Parses a string with inline Markdown and HTML and returns a React node.
 * It handles bold, italic, code, links, and images, and integrates search term highlighting.
 * @param text The string to parse.
 * @param highlightTerm The term to highlight within the text.
 * @returns A React.ReactNode with parsed and styled inline elements.
 */
const parseInlineText = (text: string, highlightTerm?: string): React.ReactNode => {
    if (!text) return null;

    // This comprehensive regex captures both Markdown and HTML inline elements.
    const inlineRegex = /(\*\*.*?\*\*|__.*?__|<strong>.*?<\/strong>|<b>.*?<\/b>|\*.*?\*|_.*?_|<em>.*?<\/em>|<i>.*?<\/i>|`.*?`|<code>.*?<\/code>|!\[.*?\]\(.*?\)|<img .*?>|\[.*?\]\(.*?\)|<a .*?>.*?<\/a>)/;
    const parts = text.split(inlineRegex);

    return (
        <>
            {parts.map((part, index) => {
                if (!part) return null;

                // Bold (MD and HTML)
                if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
                    return <strong key={index}>{parseInlineText(part.slice(2, -2), highlightTerm)}</strong>;
                }
                if ((part.startsWith('<strong>') && part.endsWith('</strong>'))) {
                    return <strong key={index}>{parseInlineText(part.slice(8, -9), highlightTerm)}</strong>;
                }
                if ((part.startsWith('<b>') && part.endsWith('</b>'))) {
                    return <strong key={index}>{parseInlineText(part.slice(3, -4), highlightTerm)}</strong>;
                }

                // Italic (MD and HTML)
                if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
                    return <em key={index}>{parseInlineText(part.slice(1, -1), highlightTerm)}</em>;
                }
                if ((part.startsWith('<em>') && part.endsWith('</em>'))) {
                    return <em key={index}>{parseInlineText(part.slice(4, -5), highlightTerm)}</em>;
                }
                if ((part.startsWith('<i>') && part.endsWith('</i>'))) {
                    return <em key={index}>{parseInlineText(part.slice(3, -4), highlightTerm)}</em>;
                }
                
                // Code (MD and HTML)
                if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={index} className="bg-surface text-accent-peach px-1.5 py-0.5 rounded-md text-sm font-mono">{part.slice(1, -1)}</code>;
                }
                if (part.startsWith('<code>') && part.endsWith('</code>')) {
                    return <code key={index} className="bg-surface text-accent-peach px-1.5 py-0.5 rounded-md text-sm font-mono">{part.slice(6, -7)}</code>;
                }

                // Image (MD and HTML)
                if (part.startsWith('![')) {
                    const [, alt, src] = part.match(/!\[(.*?)\]\((.*?)\)/) || [];
                    return <img key={index} src={src} alt={alt} className="max-w-full my-4 rounded-md shadow-md" />;
                }
                if (part.startsWith('<img')) {
                    const [, src, alt] = part.match(/src="(.*?)"\s*alt="(.*?)"/) || [];
                    return <img key={index} src={src} alt={alt} className="max-w-full my-4 rounded-md shadow-md" />;
                }
                
                // Link (MD and HTML)
                if (part.startsWith('[')) {
                    const [, linkText, href] = part.match(/\[(.*?)\]\((.*?)\)/) || [];
                    return <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{parseInlineText(linkText, highlightTerm)}</a>;
                }
                if (part.startsWith('<a')) {
                    const [, href, linkText] = part.match(/<a href="(.*?)"(?:.*?)>(.*?)<\/a>/) || [];
                    return <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{parseInlineText(linkText, highlightTerm)}</a>;
                }
                
                // Plain text
                return <HighlightedText key={index} text={part} highlight={highlightTerm} />;
            })}
        </>
    );
};

/**
 * Recursively renders Markdown list lines into nested <ul> or <ol> React elements.
 */
const renderList = (listLines: string[], highlightTerm?: string, keyPrefix: string | number = ''): React.ReactNode => {
    if (listLines.length === 0) return null;

    const items: React.ReactNode[] = [];
    let sublistLines: string[] = [];
    
    const getIndent = (line: string) => (line.match(/^(\s*)/) || ['', ''])[1].length;
    const baseIndent = getIndent(listLines[0]);

    const firstItemIsOrdered = /^\s*\d+\./.test(listLines[0]);
    const ListTag = firstItemIsOrdered ? 'ol' : 'ul';
    const listStyle = firstItemIsOrdered ? 'list-decimal' : 'list-disc';

    let currentItemContent = '';
    
    const flushItem = () => {
        if (currentItemContent) {
            items.push(
                <li key={`${keyPrefix}-${items.length}`}>
                    {parseInlineText(currentItemContent, highlightTerm)}
                    {sublistLines.length > 0 && renderList(sublistLines, highlightTerm, `${keyPrefix}-${items.length}-sub`)}
                </li>
            );
        }
        currentItemContent = '';
        sublistLines = [];
    };

    for (const line of listLines) {
        const indent = getIndent(line);
        
        if (indent === baseIndent) {
            flushItem();
            currentItemContent = line.replace(/^(\s*)([-*+]|\d+\.)\s/, '');
        } else if (indent > baseIndent) {
            sublistLines.push(line);
        }
    }
    
    flushItem();

    return <ListTag className={`${listStyle} pl-6 my-2 text-secondary space-y-1.5`}>{items}</ListTag>;
};

/**
 * Helper to find the content of a balanced HTML tag that might span multiple lines.
 * @param lines - Array of all lines to search through.
 * @param startIndex - The line index to start searching from.
 * @param tagName - The name of the tag (e.g., 'blockquote', 'ul').
 * @returns An object with the tag's content and the next line index to continue parsing from, or null if not found.
 */
const findBalancedTagContent = (lines: string[], startIndex: number, tagName: string) => {
    const allContent = lines.slice(startIndex).join('\n');
    let depth = 0;
    let endIndex = -1;

    const openTagRegex = new RegExp(`<${tagName}(?:\\s+[^>]*)*>`, 'g');
    const closeTagRegex = new RegExp(`</${tagName}>`, 'g');

    // Find the first opening tag to start from
    const firstTagMatch = allContent.match(new RegExp(`<${tagName}[^>]*>`));
    if (!firstTagMatch || typeof firstTagMatch.index === 'undefined') return null;

    for (let i = firstTagMatch.index; i < allContent.length; i++) {
        // This is a simplified check; it doesn't parse attributes perfectly but works for well-formed HTML.
        if (allContent.substring(i, i + tagName.length + 1) === `<${tagName}`) {
            depth++;
        } else if (allContent.substring(i, i + tagName.length + 3) === `</${tagName}>`) {
            depth--;
            if (depth === 0) {
                endIndex = i + tagName.length + 3;
                break;
            }
        }
    }

    if (endIndex === -1) return null; // Malformed HTML, no closing tag

    const blockContent = allContent.substring(0, endIndex);
    const contentWithinTags = blockContent.substring(firstTagMatch[0].length, blockContent.length - `</${tagName}>`.length);
    const linesConsumed = blockContent.split('\n').length;

    return {
        content: contentWithinTags.trim(),
        nextIndex: startIndex + linesConsumed,
    };
};

/**
 * Renders a full Markdown and HTML string into styled React components.
 */
const MarkdownRenderer: React.FC<{ markdown: string; highlightTerm?: string }> = ({ markdown, highlightTerm }) => {
    const lines = markdown.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (line.trim() === '') {
            i++;
            continue;
        }

        // Headings (MD and HTML)
        const headingMatch = line.match(/^(?:(#{1,6})\s(.*)|<h([1-6])>(.*?)<\/h\3>)/);
        if (headingMatch) {
            const level = headingMatch[1] ? headingMatch[1].length : parseInt(headingMatch[3], 10);
            const content = headingMatch[2] || headingMatch[4] || '';
            const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
            const classNames: Record<string, string> = {
                h1: 'text-2xl font-bold text-primary mt-6 mb-3 pb-2 border-b border-border',
                h2: 'text-xl font-semibold text-primary mt-5 mb-2 pb-1 border-b border-border',
                h3: 'text-lg font-semibold text-primary mt-4 mb-2',
                h4: 'text-base font-semibold text-primary mt-3 mb-1',
                h5: 'text-sm font-semibold text-secondary mt-2 mb-1',
                h6: 'text-xs font-semibold text-secondary mt-2 mb-1 uppercase tracking-wider',
            };
            // FIX: Use React.createElement for dynamic tags to avoid JSX type errors.
            elements.push(React.createElement(Tag, { key: i, className: classNames[`h${level}`] }, parseInlineText(content, highlightTerm)));
            i++;
            continue;
        }

        // Horizontal Rule (MD and HTML)
        if (line.match(/^(\*\*\*|---|___)\s*$/) || line.trim().match(/^<hr\s*\/?>/i)) {
            elements.push(<hr key={i} className="border-border my-6" />);
            i++;
            continue;
        }
        
        // Blockquotes (MD and HTML)
        if (line.startsWith('>') || line.trim().startsWith('<blockquote>')) {
            let blockLines: string[] = [];
            if (line.startsWith('>')) {
                while (i < lines.length && lines[i].startsWith('>')) {
                    blockLines.push(lines[i].substring(1).trim());
                    i++;
                }
            } else { // HTML Blockquote
                const result = findBalancedTagContent(lines, i, 'blockquote');
                if (result) {
                    blockLines = result.content.split('\n');
                    i = result.nextIndex;
                } else { // Malformed, treat as paragraph
                    elements.push(<p key={i} className="text-secondary leading-relaxed my-2">{parseInlineText(line, highlightTerm)}</p>);
                    i++;
                    continue;
                }
            }
            elements.push(
                <blockquote key={i} className="border-l-4 border-accent/50 pl-4 py-2 my-4 text-secondary/90 italic">
                    <MarkdownRenderer markdown={blockLines.join('\n')} highlightTerm={highlightTerm} />
                </blockquote>
            );
            continue;
        }

        // Lists (MD and HTML)
        if (line.match(/^(\s*)([-*+]|\d+\.)\s/) || line.trim().match(/^<(ul|ol)>/)) {
            if (!line.trim().startsWith('<')) { // Markdown List
                let listLines: string[] = [];
                const initialIndent = (line.match(/^(\s*)/) || ['', ''])[1].length;
                while (i < lines.length) {
                    const currentLine = lines[i];
                    if (currentLine.trim() === '') break;
                    const currentIndent = (currentLine.match(/^(\s*)/) || ['', ''])[1].length;
                    if (currentIndent < initialIndent) break;
                    if (currentIndent > initialIndent || currentLine.match(/^(\s*)([-*+]|\d+\.)\s/)) {
                        listLines.push(currentLine);
                        i++;
                    } else {
                        break;
                    }
                }
                elements.push(renderList(listLines, highlightTerm, i));
            } else { // HTML List
                // FIX: Rename listTag to ListTag for JSX compatibility and fix typo.
                const ListTag = line.trim().startsWith('<ul>') ? 'ul' : 'ol';
                const result = findBalancedTagContent(lines, i, ListTag);
                if (result) {
                    const listStyle = ListTag === 'ol' ? 'list-decimal' : 'list-disc';
                    const liRegex = /<li(?:.*?)>([\s\S]*?)<\/li>/g;
                    const listItems: React.ReactNode[] = [];
                    let match;
                    while ((match = liRegex.exec(result.content)) !== null) {
                        listItems.push(
                            <li key={listItems.length}>
                                <MarkdownRenderer markdown={match[1].trim()} highlightTerm={highlightTerm} />
                            </li>
                        );
                    }
                    elements.push(<div key={i}><ListTag className={`${listStyle} pl-6 my-2 text-secondary space-y-1.5`}>{listItems}</ListTag></div>);
                    i = result.nextIndex;
                } else { // Malformed
                    elements.push(<p key={i} className="text-secondary leading-relaxed my-2">{parseInlineText(line, highlightTerm)}</p>);
                    i++;
                }
            }
            continue;
        }
        
        // Paragraphs
        let paragraphLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== '') {
            const currentLine = lines[i];
            // Stop if a new block element is detected
            if (currentLine.match(/^(#|>|---|___|\*\*\*|\s*[-*+]|\s*\d+\.|\s*<(h[1-6]|hr|blockquote|ul|ol))/)) {
                break;
            }
            paragraphLines.push(currentLine);
            i++;
        }
        
        if (paragraphLines.length > 0) {
            elements.push(<p key={i} className="text-secondary leading-relaxed my-2">{parseInlineText(paragraphLines.join('\n'), highlightTerm)}</p>);
        }
    }

    return <div className="prose-styles">{elements}</div>;
};

/**
 * A component to preview Markdown content. It takes a raw Markdown string
 * and an optional term to highlight, then renders it as styled HTML.
 */
export const MarkdownPreview: React.FC<{ content: string, highlightTerm?: string }> = ({ content, highlightTerm }) => {
    return <MarkdownRenderer markdown={content} highlightTerm={highlightTerm} />;
};