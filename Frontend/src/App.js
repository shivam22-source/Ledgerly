import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './app/pages/LoginPage';
import RegisterPage from './app/pages/RegisterPage';
import DashboardPage from './app/pages/DashboardPage';
import AddTransactionPage from './app/pages/AddTransactionPage';
import MonthlySummaryPage from './app/pages/MonthlySummaryPage';

// Simple route guard check
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard Routes (Protected) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/add" 
          element={
            <ProtectedRoute>
              <AddTransactionPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/summary" 
          element={
            <ProtectedRoute>
              <MonthlySummaryPage />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
