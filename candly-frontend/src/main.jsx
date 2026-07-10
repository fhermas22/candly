import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './utils/style/app.css'
import App from './App'
import { applyTheme, resolveInitialTheme } from './utils/theme'

applyTheme(resolveInitialTheme());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

