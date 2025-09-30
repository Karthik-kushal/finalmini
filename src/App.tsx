import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Auth Components
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

// Public Components
import PublicEvents from './components/PublicEvents';
import EventDetails from './components/EventDetails';

// Admin Components
import AdminDashboard from './components/AdminDashboard';
import AddEvent from './components/AddEvent';
import MyEvents from './components/MyEvents';

// Student Components
import MyRSVPs from './components/MyRSVPs';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/events" element={<PublicEvents />} />
        <Route path="/event/:id" element={<EventDetails />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/create-event" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AddEvent />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/my-events" 
          element={
            <ProtectedRoute requiredRole="admin">
              <MyEvents />
            </ProtectedRoute>
          } 
        />
        
        {/* Student Routes */}
        <Route 
          path="/student/my-rsvps" 
          element={
            <ProtectedRoute requiredRole="student">
              <MyRSVPs />
            </ProtectedRoute>
          } 
        />
        
        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="*" element={<Navigate to="/events" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;