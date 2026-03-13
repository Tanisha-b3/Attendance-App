import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Pages/ProtectedRoutes';
import Layout from './layout/Layout';

// Pages
import Login from './Pages/login';
import Register from './Pages/Register';
import EmployeeDashboard from './Pages/EmployeeDashboard';
import AdminDashboard from './Pages/AdminDashboard';
import Leaves from './leaves/leaves';
import Attendance from './Pages/Attendance';
import Employees from './Pages/Employees';
import Profile from './Pages/Profile';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes with layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Employee routes */}
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="profile" element={<Profile />} />
            
            {/* Admin routes */}
            <Route path="admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="employees" element={
              <ProtectedRoute requiredRole="admin">
                <Employees />
              </ProtectedRoute>
            } />
          </Route>

          {/* Catch all - redirect to dashboard or login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;