import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // If a chunk load error occurs, reload page to load new chunks
    if (error.message && (
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed')
    )) {
      window.location.reload();
    }
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#0a0a0c',
          color: '#ffffff',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            marginBottom: '20px'
          }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #3b82f6' }} />
            <h2 style={{ 
              fontWeight: 800, 
              fontSize: '24px',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              SRI SAI MOBILES
            </h2>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 10px 0' }}>Something went wrong.</h3>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px', maxWidth: '360px', lineHeight: 1.5 }}>
            Please refresh the page to load the latest system assets and updates.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
