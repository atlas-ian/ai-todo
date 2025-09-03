import React, { useState, useEffect } from 'react';
import { healthCheck } from '../services/api';

const Dashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await healthCheck();
        setHealthStatus(response);
      } catch (err) {
        setError('Failed to connect to backend');
        console.error('Health check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  const cardStyle = {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '1.5rem'
  };

  const successStyle = {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
    color: '#166534',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #bbf7d0'
  };

  const errorStyle = {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    color: '#dc2626',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #fecaca'
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
        Connecting to backend...
      </div>
    );
  }

  return (
    <div>
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', margin: '0 0 1rem 0' }}>
          System Status
        </h2>
        
        {error ? (
          <div style={errorStyle}>
            <div style={{ fontWeight: '500' }}>Connection Error</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{error}</div>
          </div>
        ) : (
          <div style={successStyle}>
            <div style={{ fontWeight: '500' }}>✅ Backend Connected</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Status: {healthStatus?.status} | Database: {healthStatus?.database}
            </div>
            <div style={{ fontSize: '0.875rem' }}>
              Message: {healthStatus?.message}
            </div>
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', margin: '0 0 1rem 0' }}>
          Coming Soon
        </h2>
        <div style={{ color: '#6b7280' }}>
          Task management interface will be built in the next phase!
        </div>
      </div>
    </div>
  );
};

export default Dashboard;