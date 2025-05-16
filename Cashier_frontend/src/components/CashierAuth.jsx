import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

const CashierAuth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    tel_num: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)',
    padding: '1rem'
  };

  const formContainerStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '2.5rem',
    borderRadius: '1.5rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '28rem',
    transition: 'transform 0.3s ease'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '2rem'
  };

  const titleStyle = {
    fontSize: '1.875rem',
    fontWeight: '700',
    background: 'linear-gradient(45deg, #6366f1, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1.25rem',
    border: '2px solid #e2e8f0',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    color: '#1e293b',
    transition: 'all 0.3s ease',
    marginBottom: '1.5rem'
  };

  const buttonStyle = {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(45deg, #6366f1, #7c3aed)',
    color: 'white',
    fontWeight: '600',
    border: 'none',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const errorStyle = {
    padding: '0.75rem',
    background: '#fee2e2',
    color: '#dc2626',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    border: '1px solid #fca5a5'
  };

  const toggleStyle = {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#64748b'
  };

  const linkStyle = {
    color: '#6366f1',
    fontWeight: '600',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  };

  const spinnerStyle = {
    display: 'inline-block',
    width: '1.5rem',
    height: '1.5rem',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!isLogin && !formData.name) {
      setError('Name is required');
      return false;
    }
    
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    
    if (!isLogin && !/^\d{10}$/.test(formData.tel_num)) {
      setError('Invalid phone number (10 digits required)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? 'login' : 'register';
      const url = `http://localhost:4000/api/user/cashier/${endpoint}`;

      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Authentication failed');

      localStorage.setItem('token', data.token);
      navigate('/cashier-dashboard');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Cashier {isLogin ? 'Login' : 'Register'}</h1>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
                required
              />
              <input
                type="tel"
                name="tel_num"
                placeholder="Phone Number"
                value={formData.tel_num}
                onChange={handleChange}
                style={inputStyle}
                pattern="[0-9]{10}"
                required
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              ...(loading && { background: '#cbd5e1' }),
              ...(!loading && { ':hover': { transform: 'translateY(-1px)', boxShadow: '0 5px 15px rgba(99, 102, 241, 0.3)' } })
            }}
            onMouseOver={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseOut={e => !loading && (e.currentTarget.style.transform = 'none')}
          >
            {loading ? (
              <div style={spinnerStyle} />
            ) : (
              isLogin ? 'Login' : 'Register'
            )}
          </button>
        </form>

        <div style={toggleStyle}>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              style={linkStyle}
              onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CashierAuth;