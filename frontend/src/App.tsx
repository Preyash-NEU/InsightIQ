import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';

function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* More routes will be added later */}
      </Routes>
    </div>
  );
}

export default App;