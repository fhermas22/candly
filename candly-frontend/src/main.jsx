import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './utils/style/app.css'
import App from './App'

function applyInitialTheme() {
  // Default theme requirement: LIGHT
  const stored = localStorage.getItem('candly-theme');
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;

  const theme = stored === 'dark' || stored === 'light'
    ? stored
    : 'light' /* default */;

  // Note: also keep behavior consistent with system theme if user never chose.
  const resolvedTheme = stored ? theme : (prefersDark ? 'dark' : 'light');

  document.documentElement.dataset.theme = resolvedTheme;
}

applyInitialTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

