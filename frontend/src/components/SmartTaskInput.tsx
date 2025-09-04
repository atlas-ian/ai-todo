import React, { useState, useCallback } from 'react';
import { createTask, parseNaturalLanguage } from '../services/api';

interface SmartTaskInputProps {
  onTaskCreated: () => void;
}

const SmartTaskInput: React.FC<SmartTaskInputProps> = ({ onTaskCreated }) => {
  const [inputText, setInputText] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Debounced parsing function
  const parseInput = useCallback(async (text: string) => {
    if (text.trim().length < 3) {
      setParsedData(null);
      setShowPreview(false);
      return;
    }

    try {
      setLoading(true);
      const result = await parseNaturalLanguage(text);
      setParsedData(result);
      setShowPreview(true);
    } catch (error) {
      console.error('Parsing failed:', error);
      setParsedData(null);
      setShowPreview(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input changes with debouncing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      parseInput(inputText);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [inputText, parseInput]);

  const handleCreateTask = async () => {
    if (!parsedData?.parsed_task) return;

    try {
      setCreating(true);
      const taskData = {
        title: parsedData.parsed_task.title,
        description: parsedData.parsed_task.description,
        due_date: parsedData.parsed_task.due_date,
        priority: parsedData.parsed_task.priority,
        category: parsedData.parsed_task.category,
      };

      await createTask(taskData);
      setInputText('');
      setParsedData(null);
      setShowPreview(false);
      onTaskCreated();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setCreating(false);
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

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 4: return '#dc2626';
      case 3: return '#f59e0b';
      case 2: return '#3b82f6';
      case 1: return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDueDate = (dueDateString?: string) => {
    if (!dueDateString) return 'No due date';
    const date = new Date(dueDateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const containerStyle = {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '1.5rem'
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
        ✨ Add New Task
      </h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          color: '#374151', 
          marginBottom: '0.5rem' 
        }}>
          Type your task in natural language:
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g., 'Buy milk tomorrow at 5pm' or 'Important meeting with client next Monday'"
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            resize: 'vertical',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
          }}
        />
        
        {loading && (
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#6b7280', 
            marginTop: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <span>🧠</span> Analyzing your input...
          </div>
        )}
      </div>

      {/* AI Preview */}
      {showPreview && parsedData && (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '0.75rem' 
          }}>
            <span>🤖</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0369a1' }}>
              AI Detected:
            </span>
          </div>
          
          <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div>
              <strong>Task:</strong> {parsedData.preview.title}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div>
                <strong>Due:</strong> {formatDueDate(parsedData.preview.due_date)}
              </div>
              <div>
                <strong>Priority:</strong> 
                <span style={{ 
                  color: getPriorityColor(parsedData.preview.priority),
                  fontWeight: '600',
                  marginLeft: '0.25rem'
                }}>
                  {getPriorityText(parsedData.preview.priority)}
                </span>
              </div>
              <div>
                <strong>Category:</strong> 
                <span style={{ 
                  textTransform: 'capitalize',
                  marginLeft: '0.25rem'
                }}>
                  {parsedData.preview.category}
                </span>
              </div>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '0.75rem', 
            paddingTop: '0.75rem', 
            borderTop: '1px solid #bae6fd',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <button
              onClick={handleCreateTask}
              disabled={creating}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: creating ? 'not-allowed' : 'pointer',
                opacity: creating ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {creating ? 'Creating...' : '✅ Create Task'}
            </button>
            
            <button
              onClick={() => {
                setInputText('');
                setParsedData(null);
                setShowPreview(false);
              }}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
      
      {/* Examples */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.5rem' }}>
          Try these examples:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            'Buy milk tomorrow at 5pm',
            'Important meeting with client next Monday',
            'Study for exam this weekend',
            'Call dentist for appointment',
            'Grocery shopping tonight'
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setInputText(example)}
              style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                color: '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartTaskInput;