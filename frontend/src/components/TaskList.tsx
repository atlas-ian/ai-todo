import React, { useState, useEffect } from 'react';
import { Task, TaskFilters } from '../types/task';
import { getTasks, toggleTaskCompletion, deleteTask } from '../services/api';
import TaskItem from './TaskItem';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({});

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks(filters);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const handleToggleTask = async (id: number) => {
    try {
      await toggleTaskCompletion(id);
      loadTasks(); // Refresh list
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    // TODO: Implement edit functionality
    console.log('Edit task:', task);
    alert('Edit functionality coming soon!');
  };

  const handleDeleteTask = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        loadTasks(); // Refresh list
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const containerStyle = {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          Loading tasks...
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
          Your Tasks ({tasks.length})
        </h2>
        
        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={filters.completed === undefined ? 'all' : filters.completed.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setFilters(prev => ({
                ...prev,
                completed: value === 'all' ? undefined : value === 'true'
              }));
            }}
            style={{
              padding: '0.25rem 0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '0.875rem'
            }}
          >
            <option value="all">All Tasks</option>
            <option value="false">Pending</option>
            <option value="true">Completed</option>
          </select>
          
          <select
            value={filters.category || 'all'}
            onChange={(e) => {
              const value = e.target.value;
              setFilters(prev => ({
                ...prev,
                category: value === 'all' ? undefined : value
              }));
            }}
            style={{
              padding: '0.25rem 0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '0.875rem'
            }}
          >
            <option value="all">All Categories</option>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="study">Study</option>
            <option value="health">Health</option>
            <option value="shopping">Shopping</option>
          </select>
        </div>
      </div>
      
      {tasks.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem'
        }}>
          <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No tasks found</div>
          <div style={{ fontSize: '0.875rem' }}>
            {Object.keys(filters).length > 0 ? 'Try adjusting your filters' : 'Create your first task!'}
          </div>
        </div>
      ) : (
        <div>
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;