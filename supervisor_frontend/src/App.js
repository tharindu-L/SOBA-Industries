import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';

import AddMaterial from './components/AddMaterial';
import AddProduct from './components/AddProduct';
import AdminQuotations from './components/AdminQuotations';
import Dashboard from './components/Dashboard';
import JobManagement from './components/Jobs';
import LoginSignup from './components/loginsingup';
import MaterialList from './components/MaterialList';
import OrderManagement from './components/OrdersManagement';
import ProductList from './components/ProductList';
import React from 'react';
import Sidebar from './components/Sidebar';

const App = () => {
  const location = useLocation();
  const hideSidebarRoutes = ['/', '/login']; // Routes where Sidebar should not appear

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Conditionally render Sidebar based on the current route */}
        {!hideSidebarRoutes.includes(location.pathname) && <Sidebar />}
        <div className={`main-content ${!hideSidebarRoutes.includes(location.pathname) ? 'col-md-9' : 'col-md-12'}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-material" element={<AddMaterial/>} />
            <Route path="/List-material" element={<MaterialList/>} />
            <Route path="/Add-products" element={<AddProduct />} />
            <Route path="/list-products" element={<ProductList/>} />
            <Route path="/job-management" element={<JobManagement />} />
            <Route path="/login" element={<LoginSignup />} />
            <Route path="/job-list" element={<AdminQuotations />} />
            <Route path="/n-orders" element={<OrderManagement />} />
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