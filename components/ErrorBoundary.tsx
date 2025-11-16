






import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  // Fix: Removed 'public' accessor for consistency, which can resolve type inference issues.
  state: State = {
    hasError: false,
  };

  // Fix: Removed 'public' accessor for consistency.
  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  // Fix: Removed 'public' accessor for consistency.
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to the console for debugging.
    console.error("Uncaught error in Markdown Preview:", error, errorInfo);
  }

  // Fix: Removed the 'public' accessor and added an explicit 'ReactNode' return type
  // to help resolve a potential type inference issue with 'this.props'.
  render(): ReactNode {
    if (this.state.hasError) {
      // Render a fallback UI when a rendering error occurs.
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-300 bg-red-900/20 p-4 rounded-md">
            <span className="material-symbols-outlined text-3xl mb-2">error</span>
            <p className="font-semibold text-sm">Fehler bei der Vorschau</p>
            <p className="text-xs mt-1">
                Die Syntax ist möglicherweise fehlerhaft. Bitte überprüfen Sie Ihr Markdown/HTML.
            </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;