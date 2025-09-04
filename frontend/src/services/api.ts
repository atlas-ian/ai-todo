import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check
export const healthCheck = async () => {
  const response = await api.get('/tasks/health/');
  return response.data;
};

// Task API functions
export const getTasks = async (filters?: {
  completed?: boolean;
  category?: string;
  priority?: number;
}) => {
  const params = new URLSearchParams();
  if (filters?.completed !== undefined) {
    params.append('completed', filters.completed.toString());
  }
  if (filters?.category) {
    params.append('category', filters.category);
  }
  if (filters?.priority) {
    params.append('priority', filters.priority.toString());
  }
  
  const response = await api.get(`/tasks/?${params.toString()}`);
  return response.data;
};

export const createTask = async (taskData: {
  title: string;
  description?: string;
  due_date?: string;
  priority?: number;
  category?: string;
}) => {
  const response = await api.post('/tasks/', taskData);
  return response.data;
};

export const updateTask = async (id: number, taskData: any) => {
  const response = await api.patch(`/tasks/${id}/`, taskData);
  return response.data;
};

export const deleteTask = async (id: number) => {
  await api.delete(`/tasks/${id}/`);
};

export const toggleTaskCompletion = async (id: number) => {
  const response = await api.patch(`/tasks/${id}/toggle/`);
  return response.data;
};

export const getTaskStats = async () => {
  const response = await api.get('/tasks/stats/');
  return response.data;
};

export default api;