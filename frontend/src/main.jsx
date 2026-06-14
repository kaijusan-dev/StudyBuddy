import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext.jsx'
import { PetSocketProvider } from './context/PetSocketContext.jsx'
import { AdminProvider } from "./context/AdminContext.jsx";
import { BrowserRouter } from 'react-router-dom'
import { ScheduleProvider } from './context/ScheduleContext.jsx';
import App from './App.jsx'

// запрет Ctrl + wheel zoom
window.addEventListener(
  'wheel',
  (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  },
  { passive: false }
);

// запрет Ctrl +/- zoom
window.addEventListener('keydown', (e) => {
  if (
    e.ctrlKey &&
    (
      e.key === '+' ||
      e.key === '-' ||
      e.key === '='
    )
  ) {
    e.preventDefault();
  }
});

// запрет pinch zoom
window.addEventListener(
  'touchmove',
  (e) => {
    if (e.scale !== 1) {
      e.preventDefault();
    }
  },
  { passive: false }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <ScheduleProvider>
            <PetSocketProvider>
              <App />
            </PetSocketProvider>
          </ScheduleProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
