/**
 * ARQUITECTURA ME — Neuro Code Style
 * src/main.tsx — Entry point con i18n inicializado
 * ARCHITECT: Luis Reinaldo Ruiz Sarmiento
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';

// ← i18n DEBE importarse antes que App para que t() esté disponible
import './i18n/index';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
