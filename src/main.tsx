import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { SettingsWindow } from './components/SettingsWindow';
import { LanguageProvider } from './i18n/LanguageContext';
import './index.css';

const isSettings = window.location.hash.startsWith('#settings');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      {isSettings ? <SettingsWindow /> : <App />}
    </LanguageProvider>
  </React.StrictMode>
);
