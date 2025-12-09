//src/App.tsx

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { NewGame } from './pages/NewGame';
import { Rules } from './pages/Rules';
import { AuthCallback } from './pages/AuthCallback';
import { AuthProvider } from './context/AuthContext';
import { MigrationTool } from './components/MigrationTool';

export default function App() {
  // Add system theme detection
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/gin" replace />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/migrate" element={<MigrationTool />} />
          <Route path="/gin" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="new" element={<NewGame />} />
            <Route path="rules" element={<Rules />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}