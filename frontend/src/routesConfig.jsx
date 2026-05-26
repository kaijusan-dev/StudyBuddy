import WelcomePage from './pages/WelcomePage.jsx';
import PetPage from './pages/PetPage.jsx';
import Profile from './components/profile/Profile.jsx';
import AuthPage from './pages/AuthPage.jsx';

export const routes = [
  { path: '/', element: <WelcomePage />, protected: false },
  { path: '/schedule', element: <PetPage />, protected: true },
  { path: '/pet', element: <PetPage />, protected: true },
  { path: '/profile', element: <Profile />, protected: true },
  { path: '/auth/login', element: <AuthPage type="login" />, protected: false },
  { path: '/auth/register', element: <AuthPage type="register" />, protected: false },
];  