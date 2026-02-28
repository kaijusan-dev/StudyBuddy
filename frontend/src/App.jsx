import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SchedulePage from './pages/SchedulePage';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
};

export default App;