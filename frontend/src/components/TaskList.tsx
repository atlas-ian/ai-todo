import React, { useState, useCallback } from 'react';
import { Task } from '../types/task';
import { updateTask, deleteTask } from '../services/api';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

// Add the bulkDeleteTasks function directly here for now
const bulkDeleteTasks = async (taskIds: number[]): Promise<void> => {
  try {
    await Promise.all(taskIds.map(id => deleteTask(id)));
  } catch (error) {
    console.error('Failed to bulk delete tasks:', error);
    throw error;
  }
};

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskUpdate }) => {
  // Phase 1 - Edit Modal State (if you have TaskEditModal)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Phase 2 - Bulk Operations State
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Toggle task completion
  const handleToggleTask = useCallback(async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      await updateTask(taskId, { ...task, completed: !task.completed });
      onTaskUpdate();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  }, [tasks, onTaskUpdate]);

  // Phase 1 - Edit functionality
  const handleEditTask = useCallback((task: Task) => {
    // For now, just show alert until TaskEditModal is properly implemented
    alert(`Edit functionality for: ${task.title}\nThis will be implemented with the TaskEditModal component.`);
    
    // When TaskEditModal is ready:
    // setEditingTask(task);
    // setIsEditModalOpen(true);
  }, []);

  // Phase 2 - Delete functionality with confirmation
  const handleDeleteTask = useCallback(async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const confirmed = window.confirm(`Are you sure you want to delete "${task.title}"?`);
    if (!confirmed) return;

    try {
      await deleteTask(taskId);
      onTaskUpdate();
      
      // Remove from selection if it was selected
      setSelectedTaskIds(prev => prev.filter(id => id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }, [tasks, onTaskUpdate]);

  // Phase 2 - Bulk delete functionality
  const handleBulkDelete = useCallback(async (taskIds: number[]) => {
    const taskTitles = tasks.filter(t => taskIds.includes(t.id)).map(t => t.title);
    const confirmed = window.confirm(
      `Are you sure you want to delete ${taskIds.length} tasks?\n\n${taskTitles.slice(0, 3).join('\n')}${taskIds.length > 3 ? `\n...and ${taskIds.length - 3} more` : ''}`
    );
    
    if (!confirmed) return;

    try {
      await bulkDeleteTasks(taskIds);
      onTaskUpdate();
      setSelectedTaskIds([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Failed to bulk delete tasks:', error);
    }
  }, [tasks, onTaskUpdate]);

  // Phase 2 - Selection management
  const handleTaskSelect = useCallback((taskId: number) => {
    setSelectedTaskIds(prev => {
      if (prev.includes(taskId)) {
        const newSelection = prev.filter(id => id !== taskId);
        // Exit selection mode if no tasks selected
        if (newSelection.length === 0) {
          setIsSelectionMode(false);
        }
        return newSelection;
      } else {
        // Enter selection mode when first task is selected
        if (prev.length === 0) {
          setIsSelectionMode(true);
        }
        return [...prev, taskId];
      }
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedTaskIds(tasks.map(task => task.id));
    setIsSelectionMode(true);
  }, [tasks]);

  const handleDeselectAll = useCallback(() => {
    setSelectedTaskIds([]);
    setIsSelectionMode(false);
  }, []);

  if (!tasks || tasks.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 1rem',
        color: '#6b7280'
      }}>
        <div style={{
          width: '4rem',
          height: '4rem',
          margin: '0 auto 1rem',
          background: '#f3f4f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg style={{ width: '2rem', height: '2rem' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          No tasks yet
        </h3>
        <p style={{ fontSize: '0.875rem' }}>
          Create your first task using the smart input above.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Phase 2 - Simple Bulk Operations Bar */}
      {selectedTaskIds.length > 0 && (
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
              {selectedTaskIds.length} of {tasks.length} selected
            </span>
            <button
              onClick={handleSelectAll}
              style={{
                fontSize: '0.75rem',
                color: '#3b82f6',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Select All
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleBulkDelete(selectedTaskIds)}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Delete Selected
            </button>
            <button
              onClick={handleDeselectAll}
              style={{
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Selection Mode Toggle */}
      {!isSelectionMode && tasks.length > 1 && (
        <div style={{
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem',
          background: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {tasks.length} tasks • Click to select multiple tasks
          </span>
          <button
            onClick={() => setIsSelectionMode(true)}
            style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.75rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Select Tasks
          </button>
        </div>
      )}

      {/* Task List */}
      <div>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={handleToggleTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            isSelected={selectedTaskIds.includes(task.id)}
            onSelect={handleTaskSelect}
            showSelection={isSelectionMode}
          />
        ))}
      </div>

      {/* Future: Phase 1 Edit Modal would go here when ready */}
    </div>
  );
};

export default TaskList;