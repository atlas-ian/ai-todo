import React, { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { updateTask, parseNaturalLanguage } from '../services/api';

interface TaskEditModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({ task, isOpen, onClose, onTaskUpdated }) => {
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [isNLPMode, setIsNLPMode] = useState(false);
  const [nlpInput, setNlpInput] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNLPPreview, setShowNLPPreview] = useState(false);

  // Reset form when task changes
  useEffect(() => {
    setEditedTask(task);
    setNlpInput('');
    setParsedData(null);
    setShowNLPPreview(false);
    setIsNLPMode(false);
  }, [task]);

  // Handle NLP parsing with debouncing
  useEffect(() => {
    if (!isNLPMode || nlpInput.trim().length < 3) {
      setParsedData(null);
      setShowNLPPreview(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const result = await parseNaturalLanguage(nlpInput);
        setParsedData(result);
        setShowNLPPreview(true);
      } catch (error) {
        console.error('NLP parsing failed:', error);
        setParsedData(null);
        setShowNLPPreview(false);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [nlpInput, isNLPMode]);

  const handleManualFieldChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
  };

  const applyNLPResults = () => {
    if (!parsedData?.parsed_task) return;
    
    const parsed = parsedData.parsed_task;
    setEditedTask(prev => ({
      ...prev,
      title: parsed.title || prev.title,
      description: parsed.description || prev.description,
      due_date: parsed.due_date || prev.due_date,
      priority: parsed.priority || prev.priority,
      category: parsed.category || prev.category,
    }));
    
    setIsNLPMode(false);
    setShowNLPPreview(false);
    setNlpInput('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateTask(task.id, {
        title: editedTask.title,
        description: editedTask.description,
        due_date: editedTask.due_date,
        priority: editedTask.priority,
        category: editedTask.category,
      });
      onTaskUpdated();
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 4: return '#dc2626';
      case 3: return '#f59e0b';
      case 2: return '#3b82f6';
      case 1: return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 4: return 'Urgent';
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'Medium';
    }
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDateForAPI = (dateInput: string) => {
    if (!dateInput) return null;
    return new Date(dateInput).toISOString();
  };

  if (!isOpen) return null;

  const modalStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 50,
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '2rem',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
  };

  return (
    <div style={modalStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalContentStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Edit Task</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.25rem',
            }}
          >
            ×
          </button>
        </div>

        {/* Mode Toggle */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={() => setIsNLPMode(false)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: !isNLPMode ? '#3b82f6' : 'white',
                color: !isNLPMode ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              Manual Edit
            </button>
            <button
              onClick={() => setIsNLPMode(true)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: isNLPMode ? '#3b82f6' : 'white',
                color: isNLPMode ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              🤖 Smart Edit
            </button>
          </div>
        </div>

        {/* NLP Mode */}
        {isNLPMode && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#0369a1',
                marginBottom: '0.5rem'
              }}>
                Describe your changes in natural language:
              </label>
              <textarea
                value={nlpInput}
                onChange={(e) => setNlpInput(e.target.value)}
                placeholder="e.g., 'Change to high priority and make it due tomorrow at 3pm'"
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '0.75rem',
                  border: '1px solid #bae6fd',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  resize: 'vertical' as const,
                  outline: 'none'
                }}
              />
              
              {loading && (
                <div style={{ fontSize: '0.75rem', color: '#0369a1', marginTop: '0.5rem' }}>
                  🧠 Analyzing changes...
                </div>
              )}

              {/* NLP Preview */}
              {showNLPPreview && parsedData && (
                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid #bae6fd',
                  borderRadius: '0.375rem',
                  padding: '0.75rem',
                  marginTop: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0369a1', marginBottom: '0.5rem' }}>
                    Detected Changes:
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#374151' }}>
                    <div><strong>Title:</strong> {parsedData.parsed_task.title}</div>
                    <div><strong>Priority:</strong> {getPriorityText(parsedData.parsed_task.priority)}</div>
                    <div><strong>Category:</strong> {parsedData.parsed_task.category}</div>
                    <div><strong>Due Date:</strong> {parsedData.parsed_task.due_date || 'No change'}</div>
                  </div>
                  <button
                    onClick={applyNLPResults}
                    style={{
                      marginTop: '0.5rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Apply Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Edit Form */}
        {!isNLPMode && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                Title *
              </label>
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => handleManualFieldChange('title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                Description
              </label>
              <textarea
                value={editedTask.description || ''}
                onChange={(e) => handleManualFieldChange('description', e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  resize: 'vertical' as const
                }}
              />
            </div>

            {/* Priority and Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Priority
                </label>
                <select
                  value={editedTask.priority}
                  onChange={(e) => handleManualFieldChange('priority', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value={1}>Low</option>
                  <option value={2}>Medium</option>
                  <option value={3}>High</option>
                  <option value={4}>Urgent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Category
                </label>
                <select
                  value={editedTask.category}
                  onChange={(e) => handleManualFieldChange('category', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="study">Study</option>
                  <option value="health">Health</option>
                  <option value="shopping">Shopping</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                Due Date
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(editedTask.due_date)}
                onChange={(e) => handleManualFieldChange('due_date', formatDateForAPI(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>
        )}

        {/* Current Task Preview */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Preview:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: '600' }}>{editedTask.title}</span>
            <span style={{
              backgroundColor: getPriorityColor(editedTask.priority),
              color: 'white',
              fontSize: '0.7rem',
              padding: '0.125rem 0.375rem',
              borderRadius: '0.25rem'
            }}>
              {getPriorityText(editedTask.priority)}
            </span>
            <span style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              fontSize: '0.7rem',
              padding: '0.125rem 0.375rem',
              borderRadius: '0.25rem',
              textTransform: 'capitalize' as const
            }}>
              {editedTask.category}
            </span>
          </div>
          {editedTask.description && (
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              {editedTask.description}
            </div>
          )}
          {editedTask.due_date && (
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Due: {new Date(editedTask.due_date).toLocaleString()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !editedTask.title.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              backgroundColor: saving || !editedTask.title.trim() ? '#9ca3af' : '#3b82f6',
              color: 'white',
              cursor: saving || !editedTask.title.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal;