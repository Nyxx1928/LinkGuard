import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, useEffect, useState } from 'react';
import Login from './pages/Login';
import api from './api';
const Home = React.lazy(() => import('./pages/Home'));
const Landing = React.lazy(() => import('./pages/Landing'));
const PublicLookup = React.lazy(() => import('./pages/PublicLookup'));
const Analyze = React.lazy(() => import('./pages/Analyze'));
const History = React.lazy(() => import('./pages/History'));
const About = React.lazy(() => import('./pages/About'));
const ComponentShowcase = React.lazy(() => import('./pages/ComponentShowcase'));

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) { setIsLoggedIn(false); return; }
      try {
        const res = await api.get('/api/me');
        if (res.data?.authenticated) setIsLoggedIn(true);
        else { localStorage.removeItem('auth_token'); setIsLoggedIn(false); }
      } catch {
        localStorage.removeItem('auth_token');
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, []);


  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading page...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/lookup/:uuid" element={<PublicLookup />} />
            <Route path="/about" element={<About />} />
            <Route path="/showcase" element={<ComponentShowcase />} />

            {/* Auth routes */}
            <Route
              path="/login"
              element={isLoggedIn ? <Navigate to="/home" /> : <Login setIsLoggedIn={setIsLoggedIn} />}
            />

            {/* Protected routes */}
            <Route
              path="/home"
              element={isLoggedIn ? <Home setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/login" />}
            />
            <Route
              path="/analyze"
              element={isLoggedIn ? <Analyze /> : <Navigate to="/login" />}
            />
            <Route
              path="/history"
              element={isLoggedIn ? <History /> : <Navigate to="/login" />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;