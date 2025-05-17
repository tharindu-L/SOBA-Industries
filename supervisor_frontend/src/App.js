import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Navigate, Route, BrowserRouter as Router, Routes, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';

import AddMaterial from './components/AddMaterial';
import AddProduct from './components/AddProduct';
import AdminQuotations from './components/AdminQuotations';
import Dashboard from './components/Dashboard';
import JobManagement from './components/Jobs';
import LoginSignup from './components/loginsingup';
import MaterialList from './components/MaterialList';
import OrderManagement from './components/OrdersManagement';
import ProductList from './components/ProductList';
import Sidebar from './components/Sidebar';

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [navigate, token]);
  
  return token ? element : null;
};

const App = () => {
  const location = useLocation();
  const hideSidebarRoutes = ['/login']; // Routes where Sidebar should not appear

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Conditionally render Sidebar based on the current route */}
        {!hideSidebarRoutes.includes(location.pathname) && <Sidebar />}
        <div className={`main-content ${!hideSidebarRoutes.includes(location.pathname) ? 'col-md-9' : 'col-md-12'}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path="/add-material" element={<ProtectedRoute element={<AddMaterial/>} />} />
            <Route path="/list-material" element={<ProtectedRoute element={<MaterialList/>} />} />
            <Route path="/Add-products" element={<ProtectedRoute element={<AddProduct />} />} />
            <Route path="/list-products" element={<ProtectedRoute element={<ProductList/>} />} />
            <Route path="/job-management" element={<ProtectedRoute element={<JobManagement />} />} />
            <Route path="/login" element={<LoginSignup />} />
            <Route path="/job-list" element={<ProtectedRoute element={<AdminQuotations />} />} />
            <Route path="/n-orders" element={<ProtectedRoute element={<OrderManagement />} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;