// src/utils/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n/index';
import './i18n/index';
import App from './app/App';
import './index.css'; // ✅ estilos globales

class ErrorBoundary extends React.Component<any, { hasError: boolean, error: any }> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ padding: 40, color: 'red', background: '#220000', height: '100vh', fontFamily: 'monospace' }}>
        <h1>Algo salió mal 💥</h1>
        <pre>{this.state.error?.toString()}</pre>
        <pre style={{ marginTop: 20 }}>{this.state.error?.stack}</pre>
      </div>
    );
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Could not find root element to mount to');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);