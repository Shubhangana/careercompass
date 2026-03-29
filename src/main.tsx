import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite HMR and WebSocket connection errors in AI Studio
if (typeof window !== 'undefined') {
  const originalError = console.error;
  const originalWarn = console.warn;

  const isBenignError = (message: any) => {
    const msg = String(message);
    return (
      msg.includes('failed to connect to websocket') ||
      msg.includes('WebSocket closed without opened') ||
      msg.includes('[vite] failed to connect')
    );
  };

  console.error = (...args) => {
    if (isBenignError(args[0])) return;
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    if (isBenignError(args[0])) return;
    originalWarn.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isBenignError(event.reason)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
