// FIX: Changed to a namespace import and updated related types to resolve type inference issues with React class components. This fixes errors where `this.props` and `this.setState` were not found.
import * as React from 'react';

interface Props {
  children: React.ReactNode;
  resetKey?: any;
}

interface State {
  hasError: boolean;
}

// FIX: The named import for `Component` caused type inference issues. Switched to
// extending `React.Component` directly to ensure correct inheritance of props and state.
class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to the console for debugging.
    console.error("Uncaught error in component:", error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.resetKey !== prevProps.resetKey) {
      if (this.state.hasError) {
        this.setState({ hasError: false });
      }
    }
  }

  render(): React.ReactNode {
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
