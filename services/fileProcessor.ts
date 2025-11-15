import { MarkdownFile, ProcessingResult } from '../types';

/**
 * Formats a single entry's content into Logseq-compatible Markdown.
 * @param content The raw string content of a single day's entry.
 * @returns The formatted Markdown string.
 */
function formatContent(content: string): string {
  const lines = content.split('\n');
  const processedLines: string[] = [];

  for (const rawLine of lines) {
    let line = rawLine.trim();
    if (!line) continue; // Skip empty lines entirely

    // Normalize multiple spaces within the line to a single space.
    line = line.replace(/\s+/g, ' ');
    
    // Remove spaces before commas and periods.
    line = line.replace(/\s+([.,])/g, '$1');

    // Remove spaces after opening brackets and before closing brackets.
    line = line.replace(/([(\[{])\s+/g, '$1'); // e.g., ( text -> (text
    line = line.replace(/\s+([)\]}])/g, '$1'); // e.g., text ) -> text)

    // Handle TODOs and tags before checking for list markers.
    line = line.replace(/^todo /i, 'TODO ');
    line = line.replace(/# ([\w ]+)/g, (_match, tagContent) => {
      return `#${tagContent.replace(/\s/g, '')}`;
    });

    // Check for Moleskine's indentation markers to create nested lists.
    if (line.startsWith('- - - ')) {
      // Level 3 indent in Logseq (4 spaces)
      processedLines.push('    - ' + line.substring(6));
    } else if (line.startsWith('- - ')) {
      // Level 2 indent in Logseq (2 spaces)
      processedLines.push('  - ' + line.substring(4));
    } else if (line.startsWith('- ')) {
      const contentAfterHyphen = line.substring(2);
      // If the content after '- ' is a numbered list, it's a nested ordered list.
      if (/^\d+\.\s/.test(contentAfterHyphen)) {
        // Level 2 indent for nested ordered list
        processedLines.push('  - ' + contentAfterHyphen);
      } else {
        // Level 1 bullet
        processedLines.push('- ' + contentAfterHyphen);
      }
    } else if (/^\d+\.\s/.test(line)) {
      // A numbered list is a top-level item. For Logseq, we still start with a bullet.
      processedLines.push('- ' + line);
    } else {
      // This is a continuation of the previous line.
      if (processedLines.length > 0) {
        // Append to the last line.
        processedLines[processedLines.length - 1] += ' ' + line;
      } else {
        // This is the first line of an entry and has no bullet marker.
        // We'll create a new bullet for it.
        processedLines.push('- ' + line);
      }
    }
  }

  return processedLines.join('\n');
}


/**
 * Processes a Moleskine .txt export content string into an array of Markdown files.
 * @param textContent The full content of the .txt file.
 * @returns A ProcessingResult object with an array of MarkdownFile objects and an array of error strings.
 */
export function processMoleskineTxt(textContent: string): ProcessingResult {
  const result: ProcessingResult = { files: [], errors: [] };
  if (!textContent.trim()) {
    return result;
  }

  // Split content by date lines (D.M.YYYY, with optional spaces).
  // The regex uses a positive lookahead to keep the date delimiter as part of the resulting strings.
  const entries = textContent.trim().split(/^(?=\d{1,2}\s*\.\s*\d{1,2}\s*\.\s*\d{4})/m);

  for (const entry of entries) {
    const trimmedEntry = entry.trim();
    if (!trimmedEntry) continue;

    const dateMatch = trimmedEntry.match(/^(\d{1,2})\s*\.\s*(\d{1,2})\s*\.\s*(\d{4})/);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      const year = dateMatch[3];
      const filename = `${year}-${month}-${day}.md`;

      const content = trimmedEntry.substring(dateMatch[0].length).trim();
      if (content) {
        const formattedContent = formatContent(content);
        result.files.push({ filename, content: formattedContent });
      }
    } else {
      const firstLine = trimmedEntry.split('\n')[0];
      const snippet = firstLine.length > 50 ? `${firstLine.substring(0, 50)}...` : firstLine;
      result.errors.push(`Der folgende Abschnitt konnte nicht verarbeitet werden, da er nicht mit einem Datum im Format TT.MM.JJJJ beginnt: "${snippet}"`);
    }
  }

  return result;
}