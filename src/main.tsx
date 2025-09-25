import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './assets/main.css';
import './assets/main-menu.css';
import './assets/settings.css';
import './assets/level-select.css';
import './assets/game-screen.css';
import './assets/builder.css';
import './i18n';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Не удалось найти корневой элемент 'root'");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);