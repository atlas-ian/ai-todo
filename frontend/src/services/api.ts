import axios from 'axios';
import { Task } from '../types/task';

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
// Core API Endpoints
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

// ---------------------
// Phase 2: Enhanced Operations
// ---------------------

// ✅ Bulk delete tasks
export const bulkDeleteTasks = async (taskIds: number[]): Promise<void> => {
  try {
    // Option 1: Use Promise.all for concurrent deletes (current implementation)
    await Promise.all(taskIds.map(id => deleteTask(id)));
    
    // Option 2: If you add a dedicated bulk delete endpoint later:
    // const response = await api.delete('/tasks/bulk/', {
    //   data: { task_ids: taskIds }
    // });
    // return response.data;
    
    console.log(`✅ Successfully deleted ${taskIds.length} tasks`);
  } catch (error) {
    console.error('Failed to bulk delete tasks:', error);
    throw new Error(`Failed to delete ${taskIds.length} tasks`);
  }
};

// ✅ Duplicate a task
export const duplicateTask = async (task: Task): Promise<Task> => {
  try {
    const duplicatedTask = {
      title: `Copy of ${task.title}`,
      description: task.description,
      due_date: task.due_date,
      priority: task.priority,
      category: task.category,
      completed: false, // Always create duplicates as incomplete
    };

    const response = await api.post("/tasks/", duplicatedTask);
    console.log(`✅ Successfully duplicated task: ${task.title}`);
    return response.data;
  } catch (error) {
    console.error('Failed to duplicate task:', error);
    throw new Error(`Failed to duplicate task: ${task.title}`);
  }
};

// ✅ Batch update tasks
export const batchUpdateTasks = async (
  updates: { id: number; data: Partial<Task> }[]
): Promise<Task[]> => {
  try {
    const results = await Promise.all(
      updates.map(({ id, data }) => updateTask(id, data))
    );
    console.log(`✅ Successfully updated ${updates.length} tasks`);
    return results;
  } catch (error) {
    console.error('Failed to batch update tasks:', error);
    throw new Error(`Failed to update ${updates.length} tasks`);
  }
};

// ✅ Mark multiple tasks as completed
export const bulkCompleteTask = async (taskIds: number[]): Promise<void> => {
  try {
    const updates = taskIds.map(id => ({
      id,
      data: { completed: true }
    }));
    
    await batchUpdateTasks(updates);
    console.log(`✅ Successfully marked ${taskIds.length} tasks as completed`);
  } catch (error) {
    console.error('Failed to bulk complete tasks:', error);
    throw new Error(`Failed to complete ${taskIds.length} tasks`);
  }
};

// ✅ Mark multiple tasks as incomplete
export const bulkUncompleteTask = async (taskIds: number[]): Promise<void> => {
  try {
    const updates = taskIds.map(id => ({
      id,
      data: { completed: false }
    }));
    
    await batchUpdateTasks(updates);
    console.log(`✅ Successfully marked ${taskIds.length} tasks as incomplete`);
  } catch (error) {
    console.error('Failed to bulk uncomplete tasks:', error);
    throw new Error(`Failed to uncomplete ${taskIds.length} tasks`);
  }
};

// ✅ Change priority for multiple tasks
export const bulkChangePriority = async (
  taskIds: number[], 
  priority: number
): Promise<void> => {
  try {
    const updates = taskIds.map(id => ({
      id,
      data: { priority }
    }));
    
    await batchUpdateTasks(updates);
    console.log(`✅ Successfully changed priority for ${taskIds.length} tasks`);
  } catch (error) {
    console.error('Failed to bulk change priority:', error);
    throw new Error(`Failed to change priority for ${taskIds.length} tasks`);
  }
};

// ✅ Change category for multiple tasks
export const bulkChangeCategory = async (
  taskIds: number[], 
  category: string
): Promise<void> => {
  try {
    const updates = taskIds.map(id => ({
      id,
      data: { category }
    }));
    
    await batchUpdateTasks(updates);
    console.log(`✅ Successfully changed category for ${taskIds.length} tasks`);
  } catch (error) {
    console.error('Failed to bulk change category:', error);
    throw new Error(`Failed to change category for ${taskIds.length} tasks`);
  }
};

// ---------------------
// Advanced Search & Filtering
// ---------------------

// ✅ Search tasks by text
export const searchTasks = async (query: string): Promise<Task[]> => {
  try {
    const response = await api.get(`/tasks/?search=${encodeURIComponent(query)}`);
    console.log(`🔍 Found ${response.data.length} tasks matching: "${query}"`);
    return response.data;
  } catch (error) {
    console.error('Failed to search tasks:', error);
    throw new Error(`Failed to search for: ${query}`);
  }
};

// ✅ Get tasks by date range
export const getTasksByDateRange = async (
  startDate: string, 
  endDate: string
): Promise<Task[]> => {
  try {
    const params = new URLSearchParams();
    params.append('due_date_after', startDate);
    params.append('due_date_before', endDate);
    
    const response = await api.get(`/tasks/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get tasks by date range:', error);
    throw error;
  }
};

// ✅ Get overdue tasks
export const getOverdueTasks = async (): Promise<Task[]> => {
  try {
    const response = await api.get('/tasks/?overdue=true');
    return response.data;
  } catch (error) {
    // Fallback: filter client-side if backend doesn't support overdue filter
    const allTasks = await getTasks({ completed: false });
    const now = new Date();
    return allTasks.filter((task: Task) => 
      task.due_date && new Date(task.due_date) < now
    );
  }
};

// ✅ Get tasks due today
export const getTasksDueToday = async (): Promise<Task[]> => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startDate = today.toISOString().split('T')[0];
    const endDate = tomorrow.toISOString().split('T')[0];
    
    return await getTasksByDateRange(startDate, endDate);
  } catch (error) {
    console.error('Failed to get tasks due today:', error);
    throw error;
  }
};

// ---------------------
// Future: Undo Operations (for Phase 3)
// ---------------------

// ✅ Placeholder for undo functionality
export const undoDelete = async (taskData: Task[]): Promise<Task[]> => {
  // This would require backend support for undo operations
  // For now, it's a placeholder that recreates tasks
  try {
    const recreatedTasks = await Promise.all(
      taskData.map(task => createTask({
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        priority: task.priority,
        category: task.category
      }))
    );
    
    console.log(`✅ Successfully restored ${recreatedTasks.length} tasks`);
    return recreatedTasks;
  } catch (error) {
    console.error('Failed to undo delete:', error);
    throw new Error('Failed to restore deleted tasks');
  }
};

// ---------------------
// Export everything
// ---------------------

export default api;