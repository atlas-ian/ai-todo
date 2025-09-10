import axios from 'axios';

// ✅ Base URL for Django backend (use .env variable if available)
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ---------------------
// Interceptors
// ---------------------

// Log all requests
api.interceptors.request.use(
  (config) => {
    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Response Error:",
      error.response?.data || error.message
    );

    if (error.response?.status === 500) {
      console.error("❌ Server Error - Check backend logs");
    } else if (error.response?.status === 404) {
      console.error("❌ API Endpoint Not Found");
    }

    return Promise.reject(error);
  }
);

// ---------------------
// API Endpoints
// ---------------------

// ✅ Health check (make sure Django has /api/tasks/health/ endpoint)
export const healthCheck = async () => {
  try {
    const response = await api.get("/tasks/health/");
    return response.data;
  } catch (err) {
    console.error("Health check failed", err);
    throw err;
  }
};

// ✅ Task list (with optional filters)
export const getTasks = async (filters?: {
  completed?: boolean;
  category?: string;
  priority?: number;
}) => {
  const params = new URLSearchParams();
  if (filters?.completed !== undefined) {
    params.append("completed", filters.completed.toString());
  }
  if (filters?.category) {
    params.append("category", filters.category);
  }
  if (filters?.priority) {
    params.append("priority", filters.priority.toString());
  }

  const response = await api.get(`/tasks/?${params.toString()}`);
  return response.data;
};

// ✅ Create a new task
export const createTask = async (taskData: {
  title: string;
  description?: string;
  due_date?: string;
  priority?: number;
  category?: string;
}) => {
  const response = await api.post("/tasks/", taskData);
  return response.data;
};

// ✅ Update an existing task
export const updateTask = async (id: number, taskData: any) => {
  const response = await api.patch(`/tasks/${id}/`, taskData);
  return response.data;
};

// ✅ Delete a task
export const deleteTask = async (id: number) => {
  await api.delete(`/tasks/${id}/`);
};

// ✅ Toggle task completion
export const toggleTaskCompletion = async (id: number) => {
  const response = await api.patch(`/tasks/${id}/toggle/`);
  return response.data;
};

// ✅ Get task statistics
export const getTaskStats = async () => {
  const response = await api.get("/tasks/stats/");
  return response.data;
};

// ✅ NLP parsing
export const parseNaturalLanguage = async (text: string) => {
  const response = await api.post("/tasks/parse/", { text });
  return response.data;
};

export default api;
