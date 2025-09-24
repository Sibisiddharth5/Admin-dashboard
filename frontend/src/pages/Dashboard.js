import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ContainerList from '../components/ContainerList';
import Registration from './Registration';
import AdminManagement from './AdminManagement';
import { AlertModal } from '../components/Modal';

const Dashboard = ({ setIsAuthenticated }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [containers, setContainers] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info');
  const [currentUser, setCurrentUser] = useState('');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [containersRes, usersRes, statsRes, profileRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/containers/`, { headers }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/`, { headers }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/stats`, { headers }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/profile/me`, { headers })
      ]);
      
      setContainers(containersRes.data);
      setUsers(usersRes.data);
      setStats(statsRes.data);
      setCurrentUser(profileRes.data.username);
    } catch (err) {
      const message = 'Failed to fetch data: ' + (err.response?.data?.detail || err.message);
      setAlertMessage(message);
      setAlertType('error');
      setShowAlert(true);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome stats={stats} />;
      case 'containers':
        return <ContainerList containers={containers} onRefresh={fetchData} />;
      case 'users':
        return <UserList users={users} onRefresh={fetchData} />;
      case 'registration':
        return <Registration onSuccess={fetchData} />;
      case 'admin-management':
        return <AdminManagement onSuccess={fetchData} />;
      default:
        return <DashboardHome stats={stats} />;
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #95a5a6 100%)'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '40px',
          borderRadius: '16px',
          fontSize: '18px',
          fontWeight: '600',
          color: '#2d3748',
          backdropFilter: 'blur(10px)'
        }}>Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #95a5a6 100%)' }}>
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} currentUser={currentUser} />
      
      <main style={{
        flex: 1,
        marginLeft: '280px',
        minHeight: '100vh',
        padding: '20px',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch'
      }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', color: '#2d3748' }}>Admin Dashboard</h1>
          <p style={{ margin: 0, color: '#718096', fontSize: '16px' }}>Container Management System</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {renderContent()}
        </div>
      </main>
      
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertType === 'error' ? 'Error' : 'Information'}
        message={alertMessage}
        type={alertType}
      />
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = ({ stats }) => {
  return (
    <div>
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ color: '#2c3e50', margin: '0 0 12px 0', fontSize: '48px', fontWeight: '700' }}>
            {stats.total_users || 0}
          </h3>
          <p style={{ margin: 0, color: '#718096', fontWeight: '600', fontSize: '16px' }}>Total Users</p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ color: '#27ae60', margin: '0 0 12px 0', fontSize: '48px', fontWeight: '700' }}>
            {stats.running_containers || 0}
          </h3>
          <p style={{ margin: 0, color: '#718096', fontWeight: '600', fontSize: '16px' }}>Running Containers</p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ color: '#e67e22', margin: '0 0 12px 0', fontSize: '48px', fontWeight: '700' }}>
            {stats.stopped_containers || 0}
          </h3>
          <p style={{ margin: 0, color: '#718096', fontWeight: '600', fontSize: '16px' }}>Stopped Containers</p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ color: '#8e44ad', margin: '0 0 12px 0', fontSize: '48px', fontWeight: '700' }}>
            {stats.total_containers || 0}
          </h3>
          <p style={{ margin: 0, color: '#718096', fontWeight: '600', fontSize: '16px' }}>Total Containers</p>
        </div>
      </div>

      {/* System Overview */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2d3748', marginBottom: '24px' }}>
          System Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748', marginBottom: '16px' }}>
              Quick Stats
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#4a5568' }}>Active Users</span>
                <span style={{ fontWeight: '600', color: '#2c3e50' }}>{stats.total_users || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#4a5568' }}>Container Uptime</span>
                <span style={{ fontWeight: '600', color: '#27ae60' }}>98.5%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#4a5568' }}>System Health</span>
                <span style={{ fontWeight: '600', color: '#27ae60' }}>Healthy</span>
              </div>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748', marginBottom: '16px' }}>
              Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#2d3748' }}>
                  Container started
                </div>
                <div style={{ fontSize: '12px', color: '#718096' }}>2 minutes ago</div>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#2d3748' }}>
                  New user registered
                </div>
                <div style={{ fontSize: '12px', color: '#718096' }}>5 minutes ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// User List Component
const UserList = ({ users, onRefresh }) => {
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    setActionLoading({ ...actionLoading, [userId]: 'delete' });
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (err) {
      alert(`Failed to delete user: ${err.response?.data?.detail || err.message}`);
    } finally {
      setActionLoading({ ...actionLoading, [userId]: null });
    }
  };

  if (users.length === 0) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '48px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' }}>
          No users found
        </h3>
        <p style={{ color: '#718096' }}>Users will appear here once they register</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2d3748', margin: 0 }}>
          User Management
        </h2>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: '2px solid #e2e8f0',
            fontSize: '14px',
            width: '300px',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3182ce'}
          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
        />
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Name</th>
              <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Email</th>
              <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Company</th>
              <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Subdomain</th>
              <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 12px', color: '#2d3748', fontWeight: '500' }}>{user.name}</td>
                <td style={{ padding: '16px 12px', color: '#2d3748', fontWeight: '500' }}>{user.email}</td>
                <td style={{ padding: '16px 12px', color: '#2d3748', fontWeight: '500' }}>{user.company_name}</td>
                <td style={{ padding: '16px 12px', color: '#2c3e50', fontWeight: '500', fontFamily: 'monospace' }}>{user.subdomain}</td>
                <td style={{ padding: '16px 12px' }}>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={actionLoading[user.id]}
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
                    {actionLoading[user.id] === 'delete' ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;