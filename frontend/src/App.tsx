import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/Signup';
import Dashboard from './pages/Dashboard';

// Placeholder components for other routes
const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-slate-950">
    <div className="text-center">
      <h1 className="mb-4 text-4xl font-bold text-white">{title}</h1>
      <p className="text-slate-400">Coming soon...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-900">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected routes - require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* <Route path="/data-sources" element={<ComingSoon title="Data Sources" />} />
            <Route path="/analysis" element={<ComingSoon title="Analysis" />} />
            <Route path="/history" element={<ComingSoon title="History" />} />
            <Route path="/settings" element={<ComingSoon title="Settings" />} /> */}
          </Route>
          
          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;