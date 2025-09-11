import React, { useState } from 'react';
import { Task } from '../types/task';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  isSelected?: boolean;
  onSelect?: (taskId: number) => void;
  showSelection?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  isSelected = false,
  onSelect,
  showSelection = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Priority colors (matching your original style)
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

  // Format due date (matching your existing format)
  const formatDueDate = (dueDateString?: string) => {
    if (!dueDateString) return null;
    const date = new Date(dueDateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Event handlers - Fixed to use proper event types
  const handleTaskClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on buttons or checkbox
    if ((e.target as HTMLElement).closest('button, input')) {
      return;
    }

    if (showSelection && onSelect) {
      onSelect(task.id);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggle(task.id);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(task.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  // Enhanced card style with selection support
  const cardStyle = {
    background: 'white',
    padding: '1rem',
    borderRadius: '0.5rem',
    boxShadow: isSelected ? '0 4px 6px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
    marginBottom: '0.75rem',
    opacity: task.completed ? 0.6 : 1,
    cursor: showSelection ? 'pointer' : 'default',
    backgroundColor: isSelected ? '#eff6ff' : 'white',
    transition: 'all 0.2s ease'
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleTaskClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {/* Selection checkbox (if in selection mode) */}
        {showSelection && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectChange}
            style={{ 
              marginTop: '0.25rem',
              transform: 'scale(1.2)',
              cursor: 'pointer'
            }}
          />
        )}

        {/* Completion Checkbox */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleCheckboxChange}
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
              textTransform: 'capitalize' as const
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

          {/* Timestamps (only show on hover or when selected) */}
          {(isHovered || isSelected) && (
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.625rem',
              color: '#9ca3af',
              display: 'flex',
              gap: '1rem'
            }}>
              <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
              {task.updated_at !== task.created_at && (
                <span>Updated {new Date(task.updated_at).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>
        
        {/* Action Buttons - Enhanced with better hover states */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem',
          opacity: (isHovered || isSelected) ? 1 : 0.7,
          transition: 'opacity 0.2s ease'
        }}>
          <button
            onClick={handleEditClick}
            style={{
              background: isHovered ? '#e0f2fe' : '#f3f4f6',
              border: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              color: isHovered ? '#0369a1' : '#374151',
              transition: 'all 0.2s ease'
            }}
            title="Edit task"
          >
            Edit
          </button>
          <button
            onClick={handleDeleteClick}
            style={{
              background: isHovered ? '#fee2e2' : '#fef2f2',
              border: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              color: '#dc2626',
              transition: 'all 0.2s ease'
            }}
            title="Delete task"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;