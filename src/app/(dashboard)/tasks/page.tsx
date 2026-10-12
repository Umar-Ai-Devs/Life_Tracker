'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskFormModal } from '@/components/tasks/task-form-modal';
import { TaskRescheduleModal } from '@/components/tasks/task-reschedule-modal';
import { Task, Priority, TaskStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Search,
  Plus,
  SlidersHorizontal,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowUpDown,
  Tag,
} from 'lucide-react';

export default function MyTasksPage() {
  const { tasks, categories } = useAppStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'duration' | 'actual' | 'created'>('date');

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [reschedulingTask, setReschedulingTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Priority weight mapping
  const priorityWeight: Record<Priority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }

        // Status
        if (statusFilter !== 'all') {
          if (statusFilter === 'active') {
            if (t.status === 'completed' || t.status === 'cancelled') return false;
          } else if (t.status !== statusFilter) {
            return false;
          }
        }

        // Priority
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) {
          return false;
        }

        // Category
        if (categoryFilter !== 'all' && t.category_id !== categoryFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        if (sortBy === 'duration') {
          return (b.estimated_duration || 0) - (a.estimated_duration || 0);
        }
        if (sortBy === 'actual') {
          return (b.actual_duration || 0) - (a.actual_duration || 0);
        }
        if (sortBy === 'created') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        // Default: planned_date
        if (!a.planned_date && b.planned_date) return 1;
        if (a.planned_date && !b.planned_date) return -1;
        if (a.planned_date && b.planned_date) {
          return a.planned_date.localeCompare(b.planned_date);
        }
        return 0;
      });
  }, [tasks, search, statusFilter, priorityFilter, categoryFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white flex items-center gap-2">
            My Tasks
            <span className="rounded-full border border-black dark:border-white px-2 py-0.5 text-xs font-bold text-black dark:text-white">
              {filteredTasks.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Filter, search, organize, and inspect all tasks across your life.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="gap-1.5 text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black shadow-xs">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tasks by title, description, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-black placeholder-zinc-400 focus:border-black focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
          />
        </div>

        {/* Filter chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (To Do & In Progress)</option>
              <option value="inbox">Inbox</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" /> Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="date">Planned Date</option>
              <option value="priority">Priority Level</option>
              <option value="duration">Estimated Duration</option>
              <option value="actual">Actual Tracked Time</option>
              <option value="created">Recently Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <Card>
        <CardContent className="p-4">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No matching tasks found
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                Try loosening your filters or create a new task.
              </p>
              <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                <span>Create Task</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={setEditingTask}
                  onReschedule={setReschedulingTask}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <TaskFormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />

      <TaskFormModal
        open={Boolean(editingTask)}
        onOpenChange={(open) => !open && setEditingTask(null)}
        taskToEdit={editingTask}
      />

      <TaskRescheduleModal
        open={Boolean(reschedulingTask)}
        onOpenChange={(open) => !open && setReschedulingTask(null)}
        task={reschedulingTask}
      />
    </div>
  );
}
