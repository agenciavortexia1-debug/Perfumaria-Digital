
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { DB } from './services/db.ts';

// Inicializa dados de exemplo se o banco estiver vazio
DB.seed();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
