import React, { useState } from 'react';
import axios from 'axios';
import { AlertModal } from '../components/Modal';

const Login = ({ setIsAuthenticated }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Sending login request:', credentials);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/login`, credentials);
      console.log('Login successful:', response.data);
      localStorage.setItem('adminToken', response.data.token);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      const message = err.response?.data?.detail || 'Login failed';
      setAlertMessage(message);
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #95a5a6 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        width: '450px', 
        maxWidth: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: '#2d3748', marginBottom: '8px', fontSize: '32px', fontWeight: '700' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#718096', fontSize: '18px', marginBottom: '16px' }}>
            Container Management System
          </p>

        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px'
              }}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
      
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title="Login Error"
        message={alertMessage}
        type="error"
      />
    </div>
  );
};

export default Login;