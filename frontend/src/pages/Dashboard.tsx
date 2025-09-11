import React, { useState, useEffect } from 'react';
import { healthCheck, getTaskStats, getTasks } from '../services/api';
import { TaskStats, Task } from '../types/task';
import TaskList from '../components/TaskList';
import SmartTaskInput from '../components/SmartTaskInput';

const Dashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      const [health, stats, tasksData] = await Promise.all([
        healthCheck(),
        getTaskStats(),
        getTasks()
      ]);
      setHealthStatus(health);
      setTaskStats(stats);
      setTasks(tasksData);
      setError(null);
    } catch (err) {
      setError('Failed to connect to backend');
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Separate function to refresh just tasks (for TaskList)
  const refreshTasks = async () => {
    try {
      const [tasksData, stats] = await Promise.all([
        getTasks(),
        getTaskStats()
      ]);
      setTasks(tasksData);
      setTaskStats(stats);
    } catch (err) {
      console.error('Failed to refresh tasks:', err);
      setError('Failed to refresh tasks');
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  // Function to trigger refresh when new task is created
  const handleTaskCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Function for TaskList to call when tasks are updated
  const handleTaskUpdate = () => {
    refreshTasks();
  };

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
        <div style={{
          width: '2rem',
          height: '2rem',
          margin: '0 auto 1rem',
          border: '2px solid #f3f4f6',
          borderTop: '2px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#111827',
          marginBottom: '0.5rem',
          margin: 0
        }}>
          Smart ToDo Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem', margin: '0.5rem 0 0 0' }}>
          Manage your tasks with AI-powered natural language input
        </p>
      </div>

      {/* Stats Overview */}
      {taskStats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '1.5rem' 
        }}>
          <div style={cardStyle}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {taskStats.total}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Tasks</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {taskStats.completed}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Completed</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {taskStats.pending}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Pending</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>
              {taskStats.overdue}
            </div>
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
            <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center' }}>
              <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Connection Error
            </div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{error}</div>
            <button
              onClick={loadData}
              style={{
                marginTop: '0.75rem',
                padding: '0.5rem 1rem',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Health Status (when connected) */}
      {healthStatus && !error && (
        <div style={{
          ...cardStyle,
          backgroundColor: '#f0fdf4',
          borderColor: '#bbf7d0'
        }}>
          <div style={{ 
            color: '#16a34a', 
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem'
          }}>
            <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Backend Connected: {healthStatus.message || 'API is running'}
          </div>
        </div>
      )}

      {/* Smart Task Input */}
      <div style={{ marginBottom: '2rem' }}>
        <SmartTaskInput onTaskCreated={handleTaskCreated} />
      </div>

      {/* Task List - Now with required props */}
      {!loading && (
        <TaskList 
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
        />
      )}

      {/* CSS Animation for loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;