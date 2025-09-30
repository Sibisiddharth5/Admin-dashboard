import React, { useState } from 'react';
import axios from 'axios';
import { ConfirmModal, AlertModal } from './Modal';

const ContainerList = ({ containers, onRefresh }) => {
  const [actionLoading, setActionLoading] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredContainers = containers.filter(container => 
    container.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    container.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (container.user_info && (
      container.user_info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.user_info.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.user_info.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const handleContainerAction = async (containerName, action) => {
    setActionLoading({ ...actionLoading, [containerName]: action });
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/containers/${containerName}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (err) {
      setAlertMessage(`Failed to ${action} container: ${err.response?.data?.detail || err.message}`);
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setActionLoading({ ...actionLoading, [containerName]: null });
    }
  };

  if (containers.length === 0) {
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
          No containers found
        </h3>
        <p style={{ color: '#718096' }}>Containers will appear here once users register</p>
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
          Container Management
        </h2>
        <input
          type="text"
          placeholder="Search containers..."
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
        <table className="table">
          <thead>
            <tr>
              <th>Container ID</th>
              <th>Name</th>
              <th>User Info</th>
              <th>Image</th>
              <th>Status</th>
              <th>Ports</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContainers.map((container) => (
              <tr key={container.id || container.name}>
                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{container.id}</td>
                <td style={{ fontFamily: 'monospace' }}>{container.name}</td>
                <td style={{ fontSize: '12px' }}>
                  {container.user_info ? (
                    <div>
                      <div><strong>{container.user_info.name}</strong></div>
                      <div style={{ color: '#6b7280' }}>{container.user_info.company_name}</div>
                      <div style={{ color: '#3b82f6' }}>{container.user_info.subdomain}</div>
                    </div>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>No user data</span>
                  )}
                </td>
                <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  {container.image || 'nginx:alpine'}
                </td>
                <td>
                  <span className={
                    container.status === 'running' ? 'status-running' : 
                    container.status === 'not_created' ? 'status-not-created' :
                    container.status === 'docker_unavailable' ? 'status-unknown' : 
                    container.status === 'exited' ? 'status-stopped' :
                    container.status === 'created' ? 'status-stopped' : 'status-stopped'
                  }>
                    {container.status === 'not_created' ? 'Not Created' : 
                     container.status === 'docker_unavailable' ? 'Docker N/A' : 
                     container.status === 'exited' ? 'Stopped' :
                     container.status === 'created' ? 'Created' :
                     container.status}
                  </span>
                </td>
                <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                  {container.ports || 'N/A'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {container.status === 'docker_unavailable' || !container.docker_available ? (
                      <span style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic' }}>
                        Docker not available
                      </span>
                    ) : container.status === 'not_created' ? (
                      <button
                        onClick={() => handleContainerAction(container.name, 'create')}
                        disabled={actionLoading[container.name]}
                        className="btn btn-success"
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        {actionLoading[container.name] === 'create' ? 'Creating...' : 'Create'}
                      </button>
                    ) : container.status === 'running' ? (
                      <>
                        <button
                          onClick={() => handleContainerAction(container.name, 'stop')}
                          disabled={actionLoading[container.name]}
                          className="btn btn-warning"
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          {actionLoading[container.name] === 'stop' ? 'Stopping...' : 'Stop'}
                        </button>
                        <button
                          onClick={() => {
                            setConfirmAction(() => () => handleContainerAction(container.name, 'remove'));
                            setShowConfirm(true);
                          }}
                          disabled={actionLoading[container.name]}
                          className="btn btn-danger"
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          {actionLoading[container.name] === 'remove' ? 'Removing...' : 'Remove'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleContainerAction(container.name, 'start')}
                          disabled={actionLoading[container.name]}
                          className="btn btn-primary"
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          {actionLoading[container.name] === 'start' ? 'Starting...' : 'Start'}
                        </button>
                        <button
                          onClick={() => {
                            setConfirmAction(() => () => handleContainerAction(container.name, 'remove'));
                            setShowConfirm(true);
                          }}
                          disabled={actionLoading[container.name]}
                          className="btn btn-danger"
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          {actionLoading[container.name] === 'remove' ? 'Removing...' : 'Remove'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          if (confirmAction) confirmAction();
          setConfirmAction(null);
        }}
        title="Confirm Action"
        message="Are you sure you want to remove this container? This action cannot be undone."
        confirmText="Remove"
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
}

export default ContainerList;