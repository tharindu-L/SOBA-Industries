import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

const Sidebar = ({ onSelect }) => {
  const navigate = useNavigate();
  const [showBillOptions, setShowBillOptions] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const toggleBillOptions = () => {
    setShowBillOptions(!showBillOptions);
  };

  const sidebarStyle = {
    width: '250px',
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '1.5rem',
    height: '100vh',
    position: 'fixed'
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.8rem',
    margin: '0.5rem 0',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: '#3498db',
    color: 'white',
    transition: 'background-color 0.3s',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const dropdownButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#2980b9',
    margin: '0.2rem 0',
    padding: '0.6rem'
  };

  const dropdownContainerStyle = {
    marginLeft: '1rem',
    overflow: 'hidden',
    transition: 'max-height 0.3s ease',
    maxHeight: showBillOptions ? '150px' : '0'
  };

  return (
    <div style={sidebarStyle}>
      <h2 style={{color:'white'}}>Cashier Dashboard</h2>
      <div style={{ marginTop: '2rem' }}>
        {/* New Bill Dropdown */}
        <div>
          <button 
            style={buttonStyle} 
            onClick={toggleBillOptions}
          >
            New Bill
            <span>{showBillOptions ? '▲' : '▼'}</span>
          </button>
          <div style={dropdownContainerStyle}>
            <button 
              style={dropdownButtonStyle} 
              onClick={() => {
                setShowBillOptions(false);
                onSelect('custom');
              }}
            >
              Custom Order
            </button>
            <button 
              style={dropdownButtonStyle} 
              onClick={() => {
                setShowBillOptions(false);
                onSelect('create');
              }}
            >
              Standard Order
            </button>
          </div>
        </div>

        {/* Other buttons */}
        <button 
          style={buttonStyle} 
          onClick={() => onSelect('list')}
        >
          List Orders
        </button>
         
        <button 
          style={buttonStyle} 
          onClick={() => onSelect('manage')}
        >
          Online Custom Orders
        </button>
        <button 
          style={buttonStyle} 
          onClick={() => onSelect('order')}
        >
          Online Orders
        </button>
        <button 
          style={{ ...buttonStyle, backgroundColor: '#e74c3c' }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;