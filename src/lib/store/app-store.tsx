'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Task, Category, TimeEntry, UserProfile, DailySummary, Priority, TaskStatus } from '@/types';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { getTodayDateString, isTaskOverdue } from '@/lib/utils/time';

interface AppContextType {
  // Data
  tasks: Task[];
  categories: Category[];
  timeEntries: TimeEntry[];
  profile: UserProfile;
  activeTimer: {
    entryId: string;
    taskId: string;
    startTime: string; // ISO
    elapsedSeconds: number; // accumulated running
  } | null;
  activeTask: Task | null;
  isLoading: boolean;
  isSupabaseLive: boolean;

  // Actions
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  markTaskComplete: (id: string, completed?: boolean) => Promise<void>;
  rescheduleTask: (id: string, date: string | null, startTime?: string | null) => Promise<void>;
  
  // Categories
  createCategory: (name: string, color: string, icon?: string) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;

  // Timer
  startTimer: (taskId: string) => Promise<void>;
  pauseTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
  logManualTime: (taskId: string, durationMinutes: number, notes?: string, date?: string) => Promise<void>;

  // Preferences
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetToSampleData: () => void;
  
  // Queries
  getDailySummary: (dateStr: string) => DailySummary;
}

const STORAGE_KEYS = {
  TASKS: 'lifetracker_tasks_v1',
  CATEGORIES: 'lifetracker_categories_v1',
  TIME_ENTRIES: 'lifetracker_time_entries_v1',
  PROFILE: 'lifetracker_profile_v1',
  ACTIVE_TIMER: 'lifetracker_active_timer_v1',
};

// Default starter categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-work', user_id: 'local-user', name: 'Work', color: '#3b82f6', icon: 'Briefcase', created_at: new Date().toISOString() },
  { id: 'cat-dev', user_id: 'local-user', name: 'Engineering', color: '#10b981', icon: 'Code', created_at: new Date().toISOString() },
  { id: 'cat-design', user_id: 'local-user', name: 'Design', color: '#f59e0b', icon: 'Palette', created_at: new Date().toISOString() },
  { id: 'cat-personal', user_id: 'local-user', name: 'Personal', color: '#8b5cf6', icon: 'User', created_at: new Date().toISOString() },
  { id: 'cat-health', user_id: 'local-user', name: 'Health', color: '#ec4899', icon: 'Heart', created_at: new Date().toISOString() },
];

const DEFAULT_PROFILE: UserProfile = {
  id: 'local-user',
  email: '',
  full_name: 'User',
  avatar_url: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  work_start_time: '09:00',
  work_end_time: '18:00',
  theme: 'dark',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);

  // Active Timer state
  const [activeTimer, setActiveTimer] = useState<{
    entryId: string;
    taskId: string;
    startTime: string;
    elapsedSeconds: number;
  } | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const init = async () => {
      const isConfigured = isSupabaseConfigured();
      setIsSupabaseLive(isConfigured);

      if (isConfigured) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // Load user data from Supabase
            const [tasksRes, categoriesRes, entriesRes, profileRes] = await Promise.all([
              supabase.from('tasks').select('*').order('created_at', { ascending: false }),
              supabase.from('categories').select('*'),
              supabase.from('time_entries').select('*').order('created_at', { ascending: false }),
              supabase.from('profiles').select('*').eq('id', user.id).single(),
            ]);

            if (tasksRes.data) setTasks(tasksRes.data);
            if (categoriesRes.data) setCategories(categoriesRes.data);
            if (entriesRes.data) {
              setTimeEntries(entriesRes.data);
              // Check for active timer
              const active = entriesRes.data.find((e: TimeEntry) => !e.end_time);
              if (active) {
                const startMs = new Date(active.start_time).getTime();
                const elapsed = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
                setActiveTimer({
                  entryId: active.id,
                  taskId: active.task_id,
                  startTime: active.start_time,
                  elapsedSeconds: elapsed,
                });
              }
            }
            if (profileRes.data) setProfile(profileRes.data);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase initialization failed, falling back to local store:', err);
        }
      }

      // Local storage fallback
      try {
        const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
        const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        const savedEntries = localStorage.getItem(STORAGE_KEYS.TIME_ENTRIES);
        const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
        const savedActiveTimer = localStorage.getItem(STORAGE_KEYS.ACTIVE_TIMER);

        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        } else {
          setCategories(DEFAULT_CATEGORIES);
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
        }

        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        } else {
          setTasks([]);
          localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
        }

        if (savedEntries) {
          setTimeEntries(JSON.parse(savedEntries));
        } else {
          setTimeEntries([]);
          localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify([]));
        }

        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }

        if (savedActiveTimer) {
          const parsed = JSON.parse(savedActiveTimer);
          const startMs = new Date(parsed.startTime).getTime();
          const elapsed = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
          setActiveTimer({
            ...parsed,
            elapsedSeconds: elapsed,
          });
        }
      } catch (e) {
        console.error('Error loading local storage data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);


  // Save changes to localStorage when in local mode
  useEffect(() => {
    if (!isSupabaseLive && !isLoading) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(timeEntries));
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      if (activeTimer) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TIMER, JSON.stringify(activeTimer));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
      }
    }
  }, [tasks, categories, timeEntries, profile, activeTimer, isSupabaseLive, isLoading]);

  // Live Timer ticker: updates every second when activeTimer is non-null
  useEffect(() => {
    if (!activeTimer) return;

    const interval = setInterval(() => {
      const startMs = new Date(activeTimer.startTime).getTime();
      const currentSeconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      setActiveTimer((prev) => (prev ? { ...prev, elapsedSeconds: currentSeconds } : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.startTime]);

  // Currently active task
  const activeTask = useMemo(() => {
    if (!activeTimer) return null;
    return tasks.find((t) => t.id === activeTimer.taskId) || null;
  }, [activeTimer, tasks]);

  // Tasks mapped with their category object
  const populatedTasks = useMemo(() => {
    const catMap = new Map(categories.map((c) => [c.id, c]));
    return tasks.map((task) => ({
      ...task,
      category: task.category_id ? catMap.get(task.category_id) || null : null,
    }));
  }, [tasks, categories]);

  // ==========================================
  // Task Actions
  // ==========================================

  const createTask = useCallback(
    async (data: Partial<Task>): Promise<Task> => {
      const newTask: Task = {
        id: isSupabaseLive ? '' : `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        user_id: profile.id,
        title: data.title || 'Untitled Task',
        description: data.description || '',
        estimated_duration: Number(data.estimated_duration) || 30,
        planned_date: data.planned_date || null,
        start_time: data.start_time || null,
        deadline: data.deadline || null,
        priority: (data.priority as Priority) || 'medium',
        category_id: data.category_id || null,
        status: (data.status as TaskStatus) || (data.planned_date ? 'todo' : 'inbox'),
        actual_duration: 0,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseLive) {
        const supabase = createClient();
        const { data: inserted, error } = await supabase.from('tasks').insert([newTask]).select().single();
        if (error) throw error;
        setTasks((prev) => [inserted, ...prev]);
        return inserted;
      } else {
        setTasks((prev) => [newTask, ...prev]);
        return newTask;
      }
    },
    [isSupabaseLive, profile.id]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>): Promise<Task> => {
      const now = new Date().toISOString();
      const updatedFields = { ...updates, updated_at: now };

      if (updates.status === 'completed' && !updates.completed_at) {
        updatedFields.completed_at = now;
      } else if (updates.status && updates.status !== 'completed') {
        updatedFields.completed_at = null;
      }

      if (isSupabaseLive) {
        const supabase = createClient();
        const { data: updated, error } = await supabase
          .from('tasks')
          .update(updatedFields)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        return updated;
      } else {
        let updatedTask: Task | null = null;
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id === id) {
              updatedTask = { ...t, ...updatedFields };
              return updatedTask;
            }
            return t;
          })
        );
        return updatedTask!;
      }
    },
    [isSupabaseLive]
  );

  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      // If timer is running on this task, stop it
      if (activeTimer && activeTimer.taskId === id) {
        setActiveTimer(null);
      }

      if (isSupabaseLive) {
        const supabase = createClient();
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
      }

      setTasks((prev) => prev.filter((t) => t.id !== id));
      setTimeEntries((prev) => prev.filter((e) => e.task_id !== id));
    },
    [isSupabaseLive, activeTimer]
  );

  const markTaskComplete = useCallback(
    async (id: string, completed: boolean = true): Promise<void> => {
      const target = tasks.find((t) => t.id === id);
      if (!target) return;

      // If timer is running on this task, stop it first
      if (activeTimer && activeTimer.taskId === id) {
        await stopTimer();
      }

      const newStatus: TaskStatus = completed ? 'completed' : 'todo';
      await updateTask(id, {
        status: newStatus,
        completed_at: completed ? new Date().toISOString() : null,
      });
    },
    [tasks, activeTimer, updateTask]
  );

  const rescheduleTask = useCallback(
    async (id: string, date: string | null, startTime?: string | null): Promise<void> => {
      const updates: Partial<Task> = {
        planned_date: date,
        start_time: startTime !== undefined ? startTime : null,
      };
      if (date && (!startTime && startTime !== null)) {
        // Kept date
      }
      if (!date) {
        updates.status = 'inbox';
        updates.start_time = null;
      } else {
        const target = tasks.find((t) => t.id === id);
        if (target && target.status === 'inbox') {
          updates.status = 'todo';
        }
      }
      await updateTask(id, updates);
    },
    [tasks, updateTask]
  );

  // ==========================================
  // Category Actions
  // ==========================================

  const createCategory = useCallback(
    async (name: string, color: string, icon = 'Folder'): Promise<Category> => {
      const newCat: Category = {
        id: isSupabaseLive ? '' : `cat-${Date.now()}`,
        user_id: profile.id,
        name,
        color,
        icon,
        created_at: new Date().toISOString(),
      };

      if (isSupabaseLive) {
        const supabase = createClient();
        const { data, error } = await supabase.from('categories').insert([newCat]).select().single();
        if (error) throw error;
        setCategories((prev) => [...prev, data]);
        return data;
      } else {
        setCategories((prev) => [...prev, newCat]);
        return newCat;
      }
    },
    [isSupabaseLive, profile.id]
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<void> => {
      if (isSupabaseLive) {
        const supabase = createClient();
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      // Unlink category from tasks
      setTasks((prev) => prev.map((t) => (t.category_id === id ? { ...t, category_id: null } : t)));
    },
    [isSupabaseLive]
  );

  // ==========================================
  // Persistent Time Tracking Actions
  // ==========================================

  const startTimer = useCallback(
    async (taskId: string): Promise<void> => {
      // 1. If another timer is running, stop it first to enforce single active timer
      if (activeTimer) {
        if (activeTimer.taskId === taskId) {
          // Already running this task
          return;
        }
        await stopTimer();
      }

      const now = new Date().toISOString();
      const entryId = isSupabaseLive ? '' : `entry-${Date.now()}`;

      const newEntry: TimeEntry = {
        id: entryId,
        task_id: taskId,
        user_id: profile.id,
        start_time: now,
        end_time: null,
        duration: null,
        notes: null,
        created_at: now,
      };

      if (isSupabaseLive) {
        const supabase = createClient();
        const { data, error } = await supabase.from('time_entries').insert([newEntry]).select().single();
        if (error) throw error;
        setActiveTimer({
          entryId: data.id,
          taskId: taskId,
          startTime: now,
          elapsedSeconds: 0,
        });
        setTimeEntries((prev) => [data, ...prev]);
      } else {
        setActiveTimer({
          entryId,
          taskId,
          startTime: now,
          elapsedSeconds: 0,
        });
        setTimeEntries((prev) => [newEntry, ...prev]);
      }

      // Automatically update task status to in_progress if currently todo/inbox
      const currentTask = tasks.find((t) => t.id === taskId);
      if (currentTask && currentTask.status !== 'in_progress' && currentTask.status !== 'completed') {
        await updateTask(taskId, { status: 'in_progress' });
      }
    },
    [activeTimer, isSupabaseLive, profile.id, tasks, updateTask]
  );

  const pauseTimer = useCallback(async (): Promise<void> => {
    if (!activeTimer) return;
    await stopTimer();
  }, [activeTimer]);

  const stopTimer = useCallback(async (): Promise<void> => {
    if (!activeTimer) return;

    const endIso = new Date().toISOString();
    const startMs = new Date(activeTimer.startTime).getTime();
    const sessionSeconds = Math.max(1, Math.floor((Date.now() - startMs) / 1000));

    const currentTask = tasks.find((t) => t.id === activeTimer.taskId);
    const newTotalActual = (currentTask?.actual_duration || 0) + sessionSeconds;

    if (isSupabaseLive) {
      const supabase = createClient();
      await supabase
        .from('time_entries')
        .update({
          end_time: endIso,
          duration: sessionSeconds,
        })
        .eq('id', activeTimer.entryId);

      await supabase
        .from('tasks')
        .update({
          actual_duration: newTotalActual,
        })
        .eq('id', activeTimer.taskId);
    }

    // Update in-memory state
    setTimeEntries((prev) =>
      prev.map((e) =>
        e.id === activeTimer.entryId
          ? { ...e, end_time: endIso, duration: sessionSeconds }
          : e
      )
    );

    setTasks((prev) =>
      prev.map((t) =>
        t.id === activeTimer.taskId
          ? { ...t, actual_duration: newTotalActual }
          : t
      )
    );

    setActiveTimer(null);
  }, [activeTimer, isSupabaseLive, tasks]);

  const logManualTime = useCallback(
    async (taskId: string, durationMinutes: number, notes?: string, date?: string): Promise<void> => {
      const seconds = Math.round(durationMinutes * 60);
      const targetDate = date ? new Date(date) : new Date();
      const startTime = targetDate.toISOString();
      const endTime = new Date(targetDate.getTime() + seconds * 1000).toISOString();

      const newEntry: TimeEntry = {
        id: isSupabaseLive ? '' : `entry-${Date.now()}`,
        task_id: taskId,
        user_id: profile.id,
        start_time: startTime,
        end_time: endTime,
        duration: seconds,
        notes: notes || 'Manual time adjustment',
        created_at: new Date().toISOString(),
      };

      const currentTask = tasks.find((t) => t.id === taskId);
      const newTotal = (currentTask?.actual_duration || 0) + seconds;

      if (isSupabaseLive) {
        const supabase = createClient();
        const { data, error } = await supabase.from('time_entries').insert([newEntry]).select().single();
        if (error) throw error;
        await supabase.from('tasks').update({ actual_duration: newTotal }).eq('id', taskId);
        setTimeEntries((prev) => [data, ...prev]);
      } else {
        setTimeEntries((prev) => [newEntry, ...prev]);
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, actual_duration: newTotal } : t))
      );
    },
    [isSupabaseLive, profile.id, tasks]
  );

  // ==========================================
  // Profile & Reset
  // ==========================================

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<void> => {
      const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
      setProfile(updated);

      if (isSupabaseLive) {
        const supabase = createClient();
        await supabase.from('profiles').update(updates).eq('id', profile.id);
      }
    },
    [isSupabaseLive, profile]
  );

  const clearAllData = useCallback(() => {
    setTasks([]);
    setTimeEntries([]);
    setActiveTimer(null);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify([]));
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
  }, []);

  const resetToSampleData = clearAllData;

  // ==========================================
  // Calculated Summaries
  // ==========================================

  const getDailySummary = useCallback(
    (dateStr: string): DailySummary => {
      const dayTasks = tasks.filter((t) => t.planned_date === dateStr);
      const totalTasks = dayTasks.length;
      const completedTasks = dayTasks.filter((t) => t.status === 'completed').length;
      const inProgressTasks = dayTasks.filter((t) => t.status === 'in_progress').length;
      const pendingTasks = dayTasks.filter((t) => t.status === 'todo').length;
      const overdueTasks = dayTasks.filter((t) => isTaskOverdue(t.deadline, t.status)).length;

      const totalEstimatedMinutes = dayTasks.reduce((acc, t) => acc + (t.estimated_duration || 0), 0);
      const totalActualMinutes = Math.round(
        dayTasks.reduce((acc, t) => acc + (t.actual_duration || 0), 0) / 60
      );
      
      const remainingWorkloadMinutes = Math.max(
        0,
        dayTasks
          .filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
          .reduce((acc, t) => {
            const actualMin = Math.round((t.actual_duration || 0) / 60);
            return acc + Math.max(0, t.estimated_duration - actualMin);
          }, 0)
      );

      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        date: dateStr,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks,
        totalEstimatedMinutes,
        totalActualMinutes,
        remainingWorkloadMinutes,
        completionRate,
      };
    },
    [tasks]
  );

  const value = useMemo(
    () => ({
      tasks: populatedTasks,
      categories,
      timeEntries,
      profile,
      activeTimer,
      activeTask,
      isLoading,
      isSupabaseLive,
      createTask,
      updateTask,
      deleteTask,
      markTaskComplete,
      rescheduleTask,
      createCategory,
      deleteCategory,
      startTimer,
      pauseTimer,
      stopTimer,
      logManualTime,
      updateProfile,
      resetToSampleData,
      getDailySummary,
    }),
    [
      populatedTasks,
      categories,
      timeEntries,
      profile,
      activeTimer,
      activeTask,
      isLoading,
      isSupabaseLive,
      createTask,
      updateTask,
      deleteTask,
      markTaskComplete,
      rescheduleTask,
      createCategory,
      deleteCategory,
      startTimer,
      pauseTimer,
      stopTimer,
      logManualTime,
      updateProfile,
      resetToSampleData,
      getDailySummary,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
