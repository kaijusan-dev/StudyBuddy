import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/protected-route/ProtectedRoute';
import { routes } from './routesConfig';
import AdminPanel from './components/admin/AdminPanel';

function App() {
  return (
      <Routes>
        <Route element={<Layout />}>
          {routes.map(({ path, element, protected: isProtected }) => (
            <Route
              key={path}
              path={path}
              element={isProtected ? <ProtectedRoute>{element}</ProtectedRoute> : element}
            />
          ))}
          <Route path="*" element={<h1>Page Not Found</h1>} />
        </Route>
      </Routes>
  );
}

export default App;