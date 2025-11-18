import React, { useMemo, useCallback } from 'react';

// Declare globals for the CDN libraries
declare const marked: any;
declare const DOMPurify: any;

interface MarkdownPreviewProps {
  content: string;
  highlightTerm?: string;
  selectionHighlight?: string;
  onContentChange?: (newContent: string) => void;
}

/**
 * A high-performance Markdown preview component using 'marked' and 'DOMPurify'.
 * Includes custom preprocessing for Moleskine-style nested lists and interactive TODOs.
 */
export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, highlightTerm, selectionHighlight, onContentChange }) => {
  
  // 1. Preprocess Content: Handle custom nesting and TODO conversion for display
  const processedContent = useMemo(() => {
    if (!content) return '';
    
    return content.split('\n').map(line => {
        let processed = line;
        
        // 1. Handle Nested Lists ("- - ", "- - - ")
        // Convert "- - Text" -> "  - Text"
        // Convert "- - - Text" -> "    - Text"
        const listMatch = processed.match(/^((?:-\s)+)(.*)/);
        if (listMatch) {
             const dashesStr = listMatch[1];
             const rest = listMatch[2];
             // Count occurrences of "- ". 
             // "- " = 1 level (0 indent)
             // "- - " = 2 levels (1 indent unit)
             const level = (dashesStr.match(/-\s/g) || []).length;
             
             if (level > 1) {
                 // Standard Markdown uses 2 spaces per indent level
                 processed = '  '.repeat(level - 1) + '- ' + rest;
             }
        }

        // 2. Handle TODOs
        // Convert "TODO ", "ToDo ", "DONE " to standard Markdown task lists "- [ ] " or "- [x] "
        
        // Regex matches:
        // Group 1: Optional indentation and bullet (e.g. "  - ")
        // Group 2: The TODO keyword (case insensitive)
        // Group 3: The rest of the text
        
        // Case A: Already has a bullet (standard or converted above)
        // e.g. "  - ToDo buy milk"
        const bulletTodoMatch = processed.match(/^(\s*-\s+)(TODO|DONE)\s+(.*)/i);
        if (bulletTodoMatch) {
            const prefix = bulletTodoMatch[1];
            const keyword = bulletTodoMatch[2].toUpperCase();
            const rest = bulletTodoMatch[3];
            const checkbox = keyword === 'DONE' ? '[x]' : '[ ]';
            processed = `${prefix}${checkbox} ${rest}`;
        } 
        // Case B: Starts with TODO without bullet (treat as top level or indented text)
        // e.g. "ToDo buy milk" -> "- [ ] buy milk"
        else {
            const plainTodoMatch = processed.match(/^(\s*)(TODO|DONE)\s+(.*)/i);
            if (plainTodoMatch) {
                const indent = plainTodoMatch[1];
                const keyword = plainTodoMatch[2].toUpperCase();
                const rest = plainTodoMatch[3];
                const checkbox = keyword === 'DONE' ? '[x]' : '[ ]';
                processed = `${indent}- ${checkbox} ${rest}`;
            }
        }

        return processed;
    }).join('\n');
  }, [content]);

  // 2. Render HTML using marked and sanitize with DOMPurify
  const processedHtml = useMemo(() => {
    if (!processedContent) return '';
    if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
        return '<p class="text-red-400">Libraries loading...</p>';
    }

    try {
        // Configure marked for GFM (GitHub Flavored Markdown) which supports task lists
        marked.use({
            breaks: true,
            gfm: true,
        });

        // Parse
        let html = marked.parse(processedContent);

        // Sanitize
        // Explicitly allow input tags for checkboxes
        html = DOMPurify.sanitize(html, {
            ADD_TAGS: ['input'],
            ADD_ATTR: ['type', 'checked', 'disabled']
        });

        // Remove 'disabled' attribute to make checkboxes look interactive (we handle state via click handler)
        html = html.replace(/disabled=""/g, '').replace(/disabled/g, '');

        // Apply Highlighting
        if (highlightTerm && highlightTerm.trim()) {
            const term = highlightTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${term})(?![^<]*>)`, 'gi');
            html = html.replace(regex, '<mark>$1</mark>');
        }

        if (selectionHighlight && selectionHighlight.trim()) {
             const term = selectionHighlight.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
             const regex = new RegExp(`(${term})(?![^<]*>)`, 'g');
             html = html.replace(regex, '<span class="selection-highlight">$1</span>');
        }

        return html;
    } catch (e) {
        console.error("Markdown parsing error:", e);
        return '<p class="text-red-400">Error rendering preview.</p>';
    }
  }, [processedContent, highlightTerm, selectionHighlight]);

  // 3. Handle Interactivity (Checkbox clicks)
  const handleContainerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onContentChange) return;
    
    const target = e.target as HTMLElement;
    // Check if clicked element is a checkbox
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
        e.preventDefault(); // Prevent default browser toggle, we will update the source text
        
        // Determine which checkbox was clicked by index
        const checkboxes = Array.from(e.currentTarget.querySelectorAll('input[type="checkbox"]'));
        const index = checkboxes.indexOf(target as HTMLInputElement);
        
        if (index === -1) return;

        // Map the clicked checkbox index back to the source line in original content
        const lines = content.split('\n');
        let checkboxCounter = 0;
        
        const newLines = lines.map(line => {
            // We need to detect lines that RESULT in a checkbox.
            // These are:
            // 1. Standard MD: "- [ ]"
            // 2. Nested Moleskine: "- - TODO"
            // 3. Plain: "TODO"
            
            // Regex must match the SOURCE format, not the processed format.
            
            // 1. Standard Markdown Task: "- [ ]" or "- [x]" (with optional indentation)
            const mdTask = line.match(/^(\s*(?:-\s+)+)\[([ xX])\]\s(.*)/);
            
            // 2. Moleskine/Custom TODO: "- - TODO" or "- DONE" (supports multiple dash levels)
            // Matches "- - ToDo text" or "ToDo text" or "  - ToDo text"
            const customTodoMatch = line.match(/^(\s*(?:-\s+)*)(TODO|DONE)\s+(.*)/i);

            let newLine = line;
            let matched = false;

            if (mdTask) {
                if (checkboxCounter === index) {
                    const isChecked = mdTask[2].toLowerCase() === 'x';
                    const newStatus = isChecked ? ' ' : 'x'; // Toggle state
                    newLine = `${mdTask[1]}[${newStatus}] ${mdTask[3]}`;
                }
                matched = true;
            } else if (customTodoMatch) {
                if (checkboxCounter === index) {
                    const prefix = customTodoMatch[1];
                    const keyword = customTodoMatch[2].toUpperCase();
                    const rest = customTodoMatch[3];
                    // Toggle: DONE -> TODO, TODO -> DONE
                    const newKeyword = keyword === 'DONE' ? 'TODO' : 'DONE';
                    newLine = `${prefix}${newKeyword} ${rest}`;
                }
                matched = true;
            }

            if (matched) {
                checkboxCounter++;
            }
            
            return newLine;
        });

        // Only trigger update if content actually changed
        if (newLines.join('\n') !== content) {
            onContentChange(newLines.join('\n'));
        }
    }
  }, [content, onContentChange]);

  return (
    <div 
        className="markdown-content prose-styles text-primary"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
        onClick={handleContainerClick}
    />
  );
};