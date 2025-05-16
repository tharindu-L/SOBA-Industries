import React, { useEffect, useState } from 'react';

import BillingSystem from './CreateBill';
import CreateCustomOrder from './CreateCustomOrder';
import CustomOrdersList from './CustomOrdersList';
import InvoiceSection from './BillManagement';
import OrderList from './OrderList';
import OrderManagement from './OrderManagement';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const CashierDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('create');
  const [existingBills, setExistingBills] = useState([]);
  const [products] = useState([
    { id: 1, name: 'Steel Rod 12mm', price: 25.99 },
    { id: 2, name: 'Iron Sheet 2x4', price: 15.50 },
    { id: 3, name: 'Nails 1kg', price: 5.75 },
  ]);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  // Load saved bills from localStorage
  useEffect(() => {
    const savedBills = localStorage.getItem('bills');
    if (savedBills) {
      setExistingBills(JSON.parse(savedBills));
    }
  }, []);

  // Save bills to localStorage
  useEffect(() => {
    localStorage.setItem('bills', JSON.stringify(existingBills));
  }, [existingBills]);

  const handleSaveBill = (newBill) => {
    setExistingBills([newBill, ...existingBills]);
  };

  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  };

  const mainContentStyle = {
    flex: 1,
    marginLeft: '250px',
    padding: '2rem',
    transition: 'margin 0.3s'
  };

  return (
    <div style={containerStyle}>
      <Sidebar onSelect={setActiveSection} />
      
      <div style={mainContentStyle}>
        {activeSection === 'create' && (
          <BillingSystem
            products={products} 
            onSaveBill={handleSaveBill}
          />
        )}
         {activeSection === 'list' && (
          <OrderList bills={existingBills} />
        )}
         {activeSection === 'c-list' && (
          <CustomOrdersList bills={existingBills} />
        )}
         {activeSection === 'custom' && (
          <CreateCustomOrder bills={existingBills} />
        )}
        {activeSection === 'manage' && (
          <InvoiceSection bills={existingBills} />
        )}

          {activeSection === 'order' && (
          <OrderManagement bills={existingBills} />
        )}
      </div>
    </div>
  );
};

export default CashierDashboard;