
import React, { useMemo } from 'react';

// Declare globals for the CDN libraries
declare const marked: any;
declare const DOMPurify: any;

interface MarkdownPreviewProps {
  content: string;
  highlightTerm?: string;
  selectionHighlight?: string;
}

/**
 * A high-performance Markdown preview component using 'marked' and 'DOMPurify'.
 * 
 * Optimization:
 * - Uses `marked` for fast tokenizing and HTML generation (approx. 10-50x faster than React regex recursion).
 * - Uses `DOMPurify` to sanitize HTML, ensuring stability even with malformed user input.
 * - Uses useMemo to cache the expensive HTML generation operation.
 */
export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, highlightTerm, selectionHighlight }) => {
  
  // Configure marked options for security and line breaks
  useMemo(() => {
    if (typeof marked !== 'undefined') {
        marked.use({
            breaks: true, // Enable line breaks on single newline
            gfm: true,    // GitHub Flavored Markdown
        });
    }
  }, []);

  const processedHtml = useMemo(() => {
    if (!content) return '';
    if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
        return '<p class="text-red-400">Libraries loading...</p>';
    }

    try {
        // 1. Parse Markdown to HTML
        let html = marked.parse(content);

        // 2. Sanitize HTML
        html = DOMPurify.sanitize(html);

        // 3. Apply Highlighting (String manipulation on HTML content)
        // This regex attempts to match text outside of HTML tags.
        // It looks for the term, followed by any number of non-< characters, followed by > or end of string.
        // Note: This is a simplified approach. For perfect highlighting, a DOM Tree Walker is required,
        // but for a journal app, this provides a good balance of performance and accuracy.
        
        if (highlightTerm && highlightTerm.trim()) {
            const term = highlightTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex
            // The regex: Match term, ONLY if not inside a tag.
            // (?![^<]*>) asserts that we are NOT followed by a closing bracket > without an opening bracket < first.
            const regex = new RegExp(`(${term})(?![^<]*>)`, 'gi');
            html = html.replace(regex, '<mark>$1</mark>');
        }

        if (selectionHighlight && selectionHighlight.trim()) {
             const term = selectionHighlight.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
             const regex = new RegExp(`(${term})(?![^<]*>)`, 'g'); // Case sensitive for selection usually
             // Using a span class instead of mark to differentiate
             html = html.replace(regex, '<span class="selection-highlight">$1</span>');
        }

        return html;
    } catch (e) {
        console.error("Markdown parsing error:", e);
        return '<p class="text-red-400">Error rendering preview.</p>';
    }
  }, [content, highlightTerm, selectionHighlight]);

  return (
    <div 
        className="markdown-content prose-styles text-primary"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
};
