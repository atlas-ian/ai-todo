import React from 'react';
import { Task } from '../types/task';

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onEdit, onDelete }) => {
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 4: return '#dc2626'; // Red - Urgent
      case 3: return '#f59e0b'; // Orange - High
      case 2: return '#3b82f6'; // Blue - Medium
      case 1: return '#10b981'; // Green - Low
      default: return '#6b7280'; // Gray
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 4: return 'Urgent';
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'Normal';
    }
  };

  const formatDueDate = (dueDateString?: string) => {
    if (!dueDateString) return null;
    const date = new Date(dueDateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const cardStyle = {
    background: 'white',
    padding: '1rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '0.75rem',
    opacity: task.completed ? 0.6 : 1
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {/* Completion Checkbox */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          style={{ 
            marginTop: '0.25rem',
            transform: 'scale(1.2)',
            cursor: 'pointer'
          }}
        />
        
        {/* Task Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h3 style={{ 
              margin: 0,
              fontSize: '1rem',
              fontWeight: '600',
              textDecoration: task.completed ? 'line-through' : 'none',
              color: task.completed ? '#6b7280' : '#111827'
            }}>
              {task.title}
            </h3>
            
            {/* Priority Badge */}
            <span style={{
              backgroundColor: getPriorityColor(task.priority),
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '500',
              padding: '0.125rem 0.5rem',
              borderRadius: '0.375rem'
            }}>
              {getPriorityText(task.priority)}
            </span>
            
            {/* Category Badge */}
            <span style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              fontSize: '0.75rem',
              fontWeight: '500',
              padding: '0.125rem 0.5rem',
              borderRadius: '0.375rem',
              textTransform: 'capitalize'
            }}>
              {task.category}
            </span>
          </div>
          
          {task.description && (
            <p style={{ 
              margin: '0.25rem 0',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              {task.description}
            </p>
          )}
          
          {task.due_date && (
            <div style={{
              fontSize: '0.75rem',
              color: task.is_overdue ? '#dc2626' : '#6b7280',
              fontWeight: task.is_overdue ? '600' : '400'
            }}>
              Due: {formatDueDate(task.due_date)}
              {task.is_overdue && ' (OVERDUE)'}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onEdit(task)}
            style={{
              background: '#f3f4f6',
              border: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              color: '#374151'
            }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            style={{
              background: '#fee2e2',
              border: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              color: '#dc2626'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;