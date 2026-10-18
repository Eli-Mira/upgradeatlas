import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Self-hosted fonts. No CDN request, no flash of fallback face.
import '@fontsource-variable/archivo'
import '@fontsource/ibm-plex-sans-arabic/400.css'
import '@fontsource/ibm-plex-sans-arabic/500.css'
import '@fontsource/ibm-plex-sans-arabic/600.css'

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)