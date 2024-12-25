import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { NewGame } from './pages/NewGame';
import { ImportGames } from './pages/ImportGames';
import { Rules } from './pages/Rules';
import { AuthCallback } from './pages/AuthCallback';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/gin" replace />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/gin" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="new" element={<NewGame />} />
            <Route path="import" element={<ImportGames />} />
            <Route path="rules" element={<Rules />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;