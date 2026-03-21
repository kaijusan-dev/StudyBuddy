import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext.jsx'
import { PetSocketProvider } from './context/PetSocketContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PetSocketProvider>
            <App />
        </PetSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
