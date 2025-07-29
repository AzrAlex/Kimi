import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import Demandes from './pages/Demandes';
import Mouvements from './pages/Mouvements';
import Historique from './pages/Historique';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/articles" element={
              <ProtectedRoute>
                <Layout>
                  <Articles />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/demandes" element={
              <ProtectedRoute>
                <Layout>
                  <Demandes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/mouvements" element={
              <ProtectedRoute adminOnly>
                <Layout>
                  <Mouvements />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/historique" element={
              <ProtectedRoute>
                <Layout>
                  <Historique />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;