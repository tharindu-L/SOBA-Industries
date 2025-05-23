import './loginsingup.css'; // Import the custom CSS file for better styling
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginSignup = () => {
  // Change this to always be login (remove toggle functionality)
  const [isLogin, setIsLogin] = useState(true); // Now we'll keep this true and not change it
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    tel_num: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      navigate('/dashboard'); // Redirect to dashboard if token exists
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage(''); // Clear any previous errors
      
      const url = 'http://localhost:4000/api/supervisors/login';
      
      // Only send email and password for login
      const loginData = {
        email: formData.email,
        password: formData.password
      };
      
      console.log('Making login request to:', url);
      console.log('With data:', loginData);
      
      // Use the correct data structure for login
      const response = await axios.post(url, loginData);
      console.log('Response received:', response.data);

      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        console.log('Token stored:', response.data.token);
        
        // Use window.location for a complete page reload/redirect
        window.location.href = '/dashboard';
      } else {
        setErrorMessage(response.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error details:', error);
      
      // More detailed error handling
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setErrorMessage(error.response.data.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setErrorMessage('No response from server. Please check your connection.');
      } else {
        console.error('Error message:', error.message);
        setErrorMessage(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="login-signup-wrapper" style={{marginLeft:'-450px'}}>
      <div className="login-signup-card">
        <div className="card-header text-center">
          <h4>Production Manager Login</h4>
        </div>
        <div className="card-body">
          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
