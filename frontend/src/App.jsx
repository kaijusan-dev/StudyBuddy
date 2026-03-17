import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SchedulePage from './pages/SchedulePage';
import AuthPage from './pages/AuthPage';
import WelcomePage from './pages/WelcomePage';
import Layout from './components/layout/Layout';
import ProfilePage from './pages/ProfilePage';
import PetPage from './pages/PetPage';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout/>}>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/auth/register" element={<AuthPage type='register'/>} />
          <Route path="/auth/login" element={<AuthPage type='login' />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/pet" element={<PetPage />} />
          <Route path="*" element={<h1>Page Not Found</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
};

export default App;