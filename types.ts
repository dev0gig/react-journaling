
export interface MarkdownFile {
  filename: string;
  content: string;
}

export interface ProcessingResult {
  files: MarkdownFile[];
  errors: string[];
}

export interface Anecdote {
  id: string;
  date: string;
  text: string;
}