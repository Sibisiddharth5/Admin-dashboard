import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertModal, ConfirmModal } from '../components/Modal';

const AdminManagement = ({ onSuccess }) => {
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info');
  const [showConfirm, setShowConfirm] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('https://app.kambaa.ai/api/admin-management/admins', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(response.data);
    } catch (err) {
      setAlertMessage('Failed to fetch admins');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('https://app.kambaa.ai/api/admin-management/admins', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlertMessage('Admin created successfully');
      setAlertType('success');
      setShowAlert(true);
      setFormData({ username: '', password: '' });
      fetchAdmins();
    } catch (err) {
      setAlertMessage(err.response?.data?.detail || 'Failed to create admin');
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`https://app.kambaa.ai/api/admin-management/admins/${adminToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlertMessage('Admin deleted successfully');
      setAlertType('success');
      setShowAlert(true);
      fetchAdmins();
    } catch (err) {
      setAlertMessage(err.response?.data?.detail || 'Failed to delete admin');
      setAlertType('error');
      setShowAlert(true);
    }
    setShowConfirm(false);
    setAdminToDelete(null);
  };

  return (
    <div>
      {/* Create Admin Form */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2d3748', marginBottom: '24px' }}>
          Create New Admin
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '12px 24px' }}
          >
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </form>
      </div>

      {/* Admin List */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2d3748', marginBottom: '24px' }}>
          Admin Users
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>ID</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Username</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Created At</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px 12px', color: '#2d3748', fontWeight: '500' }}>{admin.id}</td>
                  <td style={{ padding: '16px 12px', color: '#2d3748', fontWeight: '500' }}>{admin.username}</td>
                  <td style={{ padding: '16px 12px', color: '#2d3748', fontWeight: '500' }}>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <button
                      onClick={() => {
                        setAdminToDelete(admin);
                        setShowConfirm(true);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete admin "${adminToDelete?.username}"?`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertType === 'error' ? 'Error' : 'Success'}
        message={alertMessage}
        type={alertType}
      />
    </div>
  );
};

export default AdminManagement;