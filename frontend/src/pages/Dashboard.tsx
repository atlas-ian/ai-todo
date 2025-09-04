import React, { useState, useEffect } from 'react';
import { healthCheck, getTaskStats } from '../services/api';
import { TaskStats } from '../types/task';
import TaskList from '../components/TaskList';

const Dashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [health, stats] = await Promise.all([
          healthCheck(),
          getTaskStats()
        ]);
        setHealthStatus(health);
        setTaskStats(stats);
      } catch (err) {
        setError('Failed to connect to backend');
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const cardStyle = {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '1.5rem'
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      {/* Stats Overview */}
      {taskStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{taskStats.total}</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Tasks</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{taskStats.completed}</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Completed</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{taskStats.pending}</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Pending</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>{taskStats.overdue}</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Overdue</div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {error && (
        <div style={cardStyle}>
          <div style={{
            backgroundColor: '#fef2f2',
            borderColor: '#fecaca',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #fecaca'
          }}>
            <div style={{ fontWeight: '500' }}>Connection Error</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Task List */}
      <TaskList />
    </div>
  );
};

export default Dashboard;