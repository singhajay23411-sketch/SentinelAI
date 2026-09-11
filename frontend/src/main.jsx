import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ScanProvider } from './context/ScanContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ScanProvider>
        <App />
      </ScanProvider>
    </AuthProvider>
  </StrictMode>,
)
