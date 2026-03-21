import WelcomePage from './pages/WelcomePage.jsx';
import SchedulePage from './pages/SchedulePage.jsx';
import PetPage from './pages/PetPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AuthPage from './pages/AuthPage.jsx';

export const routes = [
  { path: '/', element: <WelcomePage />, protected: false },
  { path: '/schedule', element: <SchedulePage />, protected: true },
  { path: '/pet', element: <PetPage />, protected: true },
  { path: '/profile', element: <ProfilePage />, protected: true },
  { path: '/auth/login', element: <AuthPage type="login" />, protected: false },
  { path: '/auth/register', element: <AuthPage type="register" />, protected: false },
];