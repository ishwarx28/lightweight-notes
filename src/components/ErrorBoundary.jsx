import { Component, createElement } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return createElement('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '2rem',
          textAlign: 'center',
          color: '#0f172a',
          background: '#f8fafc',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        },
      },
        createElement('h1', { style: { fontSize: '1.5rem', marginBottom: '0.5rem' } }, 'Something went wrong'),
        createElement('p', { style: { color: '#64748b', marginBottom: '1.5rem' } }, this.state.error?.message || 'An unexpected error occurred.'),
        createElement('button', {
          onClick: () => {
            this.setState({ hasError: false, error: null });
            window.location.href = '/';
          },
          style: {
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: '#6366f1',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          },
        }, 'Go Home'),
      );
    }

    return this.props.children;
  }
}
