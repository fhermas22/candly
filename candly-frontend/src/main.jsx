import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './utils/style/app.css'
import LandingPage from './pages/LandingPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>,
)
