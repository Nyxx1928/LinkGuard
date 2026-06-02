import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, useEffect, useState, useCallback } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import api from './api';
const Home = React.lazy(() => import('./pages/Home'));
const Landing = React.lazy(() => import('./pages/Landing'));
const PublicLookup = React.lazy(() => import('./pages/PublicLookup'));
const Analyze = React.lazy(() => import('./pages/Analyze'));
const History = React.lazy(() => import('./pages/History'));
const About = React.lazy(() => import('./pages/About'));
const ComponentShowcase = React.lazy(() => import('./pages/ComponentShowcase'));

const SESSION_DURATION = 120 * 60 * 1000; // 120 minutes
const WARNING_BEFORE = 5 * 60 * 1000;     // warn 5 minutes before expiry
const CHECK_INTERVAL = 15 * 1000;          // check every 15 seconds

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('session_start');
    setIsLoggedIn(false);
    setSessionWarning(false);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) { setIsLoggedIn(false); return; }
      try {
        const res = await api.get('/api/me');
        if (res.data?.authenticated) setIsLoggedIn(true);
        else { logout(); }
      } catch {
        logout();
      }
    };
    checkSession();
  }, [logout]);

  // Listen for session-expired events from api.js interceptor
  useEffect(() => {
    const handleExpired = () => {
      setIsLoggedIn(false);
      setSessionWarning(false);
    };
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, []);

  // Session timeout timer
  useEffect(() => {
    if (!isLoggedIn) {
      setSessionWarning(false);
      setRemainingMinutes(null);
      return;
    }

    const tick = () => {
      const start = localStorage.getItem('session_start');
      if (!start) {
        logout();
        return;
      }
      const elapsed = Date.now() - parseInt(start, 10);
      const remaining = SESSION_DURATION - elapsed;

      if (remaining <= 0) {
        logout();
        return;
      }

      if (remaining <= WARNING_BEFORE) {
        setSessionWarning(true);
        setRemainingMinutes(Math.ceil(remaining / 1000 / 60));
      } else {
        setSessionWarning(false);
        setRemainingMinutes(null);
      }
    };

    tick();
    const id = setInterval(tick, CHECK_INTERVAL);
    return () => clearInterval(id);
  }, [isLoggedIn, logout]);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {sessionWarning && (
          <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-900/90 backdrop-blur border-b border-yellow-600/50 px-4 py-3 text-center">
            <p className="text-yellow-200 text-sm">
              Your session will expire in <strong>{remainingMinutes} minute{remainingMinutes !== 1 ? 's' : ''}</strong>.
              Please save your work.
            </p>
          </div>
        )}
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
            <Route
              path="/register"
              element={isLoggedIn ? <Navigate to="/home" /> : <Register setIsLoggedIn={setIsLoggedIn} />}
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