export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'inbox' | 'todo' | 'in_progress' | 'completed' | 'cancelled';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon?: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  estimated_duration: number; // in minutes
  planned_date?: string | null; // YYYY-MM-DD
  start_time?: string | null; // HH:MM or HH:MM:SS
  deadline?: string | null; // ISO string
  priority: Priority;
  category_id?: string | null;
  status: TaskStatus;
  actual_duration: number; // accumulated duration in seconds
  completed_at?: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations (optional)
  category?: Category | null;
}

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string; // ISO string
  end_time?: string | null; // ISO string, null if running
  duration?: number | null; // in seconds
  notes?: string | null;
  created_at: string;

  // Joined task details
  task?: Task | null;
}

export interface UserProfile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  timezone: string;
  work_start_time: string; // "09:00"
  work_end_time: string; // "18:00"
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}

export interface DailySummary {
  date: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalEstimatedMinutes: number;
  totalActualMinutes: number;
  remainingWorkloadMinutes: number;
  completionRate: number;
}
