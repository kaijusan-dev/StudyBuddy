import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext.jsx'
import { PetSocketProvider } from './context/PetSocketContext.jsx'
import { AdminProvider } from "./context/AdminContext.jsx";
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <PetSocketProvider>
            <App />
          </PetSocketProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
