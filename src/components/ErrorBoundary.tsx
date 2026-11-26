import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let parsedMessage = error.message || 'An unexpected application error occurred.';
    try {
      const parsed = JSON.parse(error.message) as { error?: string; operationType?: string; path?: string };
      if (parsed && parsed.error) {
        parsedMessage = `${parsed.error}${parsed.path ? ` (${parsed.operationType || 'read'} on ${parsed.path})` : ''}`;
      }
    } catch {
      // Plain error string
    }
    return { hasError: true, message: parsedMessage };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#07152F] px-6 py-24 text-center text-[#F5F3EF]">
          <div className="max-w-lg border border-[#D9AE61]/35 bg-[#05070D]/90 p-8 shadow-2xl">
            <AlertTriangle size={32} className="mx-auto text-[#D9AE61]" aria-hidden="true" />
            <h1 className="mt-4 font-display text-3xl font-light text-white">
              Connection or Permission Notice
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#C9D1DC]">{this.state.message}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-luxury-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.18em] uppercase text-white"
              >
                <RefreshCw size={14} aria-hidden="true" />
                <span>Reload Page</span>
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, message: '' })}
                className="btn-luxury inline-flex items-center px-5 py-2.5 text-xs tracking-[0.18em] uppercase text-[#E6EAF0]"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
