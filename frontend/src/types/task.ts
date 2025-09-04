export interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority: number;
  category: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  is_overdue: boolean;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface TaskFilters {
  completed?: boolean;
  category?: string;
  priority?: number;
}