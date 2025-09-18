import React from 'react';

const Sidebar = ({ activeSection, setActiveSection, currentUser }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Users' },
    { id: 'containers', label: 'Containers' },
    { id: 'registration', label: 'Registration' },
    { id: 'admin-management', label: 'Admin Management' }
  ];

  return (
    <div style={{
      width: '280px',
      height: '100vh',
      background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000,
      boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
    }}>
      {/* Logo */}
      <div style={{
        padding: '32px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            A
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>{currentUser || 'Admin'}</h2>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Container Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '24px 0', overflow: 'hidden' }}>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            style={{
              width: '100%',
              padding: '16px 24px',
              border: 'none',
              background: activeSection === item.id ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              borderLeft: activeSection === item.id ? '4px solid white' : '4px solid transparent',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (activeSection !== item.id) {
                e.target.style.background = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== item.id) {
                e.target.style.background = 'transparent';
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Date Section */}
      <div style={{
        padding: '24px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.1)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '800',
            marginBottom: '8px',
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {new Date().getDate()}
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '4px',
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: '0.5px'
          }}>
            {new Date().toLocaleDateString('en-US', { month: 'long' })}
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: 'rgba(255,255,255,0.8)',
            letterSpacing: '1px'
          }}>
            {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;