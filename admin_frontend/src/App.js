import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';

import AdminInvoices from './components/AdminInvoices';
import CreateAccount from './components/CreateAccount';
import CustomOrderList from './components/CustomOrderList';
import Dashboard from './components/Chart';
import InvoiceList from './components/InvoiceList';
import OrderList from './components/OrderList';
import Reports from './pages/Reports'; // Import the Reports component
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const auth = useAuth() || { isAuthenticated: false };
  const { isAuthenticated } = auth;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  const auth = useAuth() || { isAuthenticated: false };
  const { isAuthenticated } = auth;

  return (
    <AuthProvider>
      <Router>
        <div className="container-fluid">
          <div className="row">
            <Sidebar />
            <div className="col-md-9 main-content">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Root route should redirect based on auth status */}
                <Route 
                  path="/" 
                  element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
                />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route 
                  path="/invoices" 
                  element={
                    <ProtectedRoute>
                      <AdminInvoices />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/c-orders" 
                  element={
                    <ProtectedRoute>
                      <CustomOrderList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <OrderList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/bills" 
                  element={
                    <ProtectedRoute>
                      <InvoiceList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/create-account" 
                  element={
                    <ProtectedRoute>
                      <CreateAccount />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
