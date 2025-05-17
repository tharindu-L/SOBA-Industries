import React from 'react';
import { Link } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import './Sidebar.css'; // Make sure to have your CSS file

const Sidebar = () => {
  return (
    <div className="col-md-3 sidebar bg-dark">
      <div className="d-flex flex-column p-3 text-white">
        <h2 className="text-center mb-4">Admin Panel</h2>
        <hr />
        <Nav className="flex-column mb-auto">
          <Nav.Item>
            <Link to="/dashboard" className="nav-link text-white">
              <i className="fas fa-tachometer-alt me-2"></i> Dashboard
            </Link>
          </Nav.Item>
          
          <Nav.Item>
            <Link to="/orders" className="nav-link text-white">
              <i className="fas fa-shopping-cart me-2"></i> Orders
            </Link>
          </Nav.Item>
          
          <Nav.Item>
            <Link to="/c-orders" className="nav-link text-white">
              <i className="fas fa-box-open me-2"></i> Custom Orders
            </Link>
          </Nav.Item>
          
          {/* Invoices tab removed */}
          
          <Nav.Item>
            <Link to="/bills" className="nav-link text-white">
              <i className="fas fa-receipt me-2"></i> Bills
            </Link>
          </Nav.Item>
          
          <Nav.Item>
            <Link to="/create-account" className="nav-link text-white">
              <i className="fas fa-user-plus me-2"></i> Create Account
            </Link>
          </Nav.Item>
          
          <hr />
          
          <Nav.Item>
            <Link to="/logout" className="nav-link text-white">
              <i className="fas fa-sign-out-alt me-2"></i> Logout
            </Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;