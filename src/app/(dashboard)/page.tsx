'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { getTodayDateString } from '@/lib/utils/time';
import { DashboardMetrics } from '@/components/dashboard/dashboard-metrics';
import { CurrentFocusWidget } from '@/components/dashboard/current-focus-widget';
import { ActiveTimerWidget } from '@/components/timer/active-timer-widget';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskFormModal } from '@/components/tasks/task-form-modal';
import { TaskRescheduleModal } from '@/components/tasks/task-reschedule-modal';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  CalendarDays,
  Plus,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { tasks, getDailySummary, isLoading } = useAppStore();

  const [todayStr, setTodayStr] = useState('2026-10-12');
  useEffect(() => {
    setTodayStr(getTodayDateString());
  }, []);

  const summary = getDailySummary(todayStr);

  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [reschedulingTask, setReschedulingTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const todayTasks = tasks.filter((t) => t.planned_date === todayStr);

  const filteredTasks = todayTasks.filter((t) => {
    if (filter === 'pending') return t.status === 'todo';
    if (filter === 'in_progress') return t.status === 'in_progress';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-slate-200/50 dark:bg-slate-800" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200/50 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Dashboard
            <span className="text-xs font-normal text-slate-400 border border-slate-200 dark:border-slate-800 rounded-full px-2 py-0.5">
              Today: {todayStr}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track daily progress, balance your hourly workload, and manage focus sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/planner">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <CalendarDays className="h-4 w-4" />
              <span>Hourly Planner</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {/* 6 Core Metrics Cards */}
      <DashboardMetrics summary={summary} />

      {/* Active Timer Card (if running) */}
      <ActiveTimerWidget />

      {/* Current Hour / Next Task Focus Widget */}
      <CurrentFocusWidget todayTasks={todayTasks} />

      {/* Today's Schedule & Tasks List */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-black dark:text-white">
              <span>Today&apos;s Planned Tasks</span>
              <span className="rounded-full border border-black dark:border-white px-2 py-0.5 text-xs font-bold text-black dark:text-white">
                {todayTasks.length}
              </span>
            </CardTitle>
            <p className="text-xs text-zinc-500">
              Tasks scheduled to be tackled today
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex rounded-xl bg-zinc-100 p-0.5 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                All ({todayTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('in_progress')}
                className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                  filter === 'in_progress'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                In Progress ({todayTasks.filter((t) => t.status === 'in_progress').length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('pending')}
                className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                  filter === 'pending'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Pending ({todayTasks.filter((t) => t.status === 'todo').length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('completed')}
                className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                  filter === 'completed'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Done ({todayTasks.filter((t) => t.status === 'completed').length})
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {filter === 'all'
                  ? 'No tasks scheduled for today'
                  : `No ${filter} tasks for today`}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                {filter === 'all'
                  ? 'Quickly capture an item or pull tasks from your inbox into today.'
                  : 'Change filters or add a new task.'}
              </p>
              <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Task for Today</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
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

      {/* Task Creation Modal */}
      <TaskFormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        defaultDate={todayStr}
      />

      {/* Task Edit Modal */}
      <TaskFormModal
        open={Boolean(editingTask)}
        onOpenChange={(open) => !open && setEditingTask(null)}
        taskToEdit={editingTask}
      />

      {/* Reschedule Modal */}
      <TaskRescheduleModal
        open={Boolean(reschedulingTask)}
        onOpenChange={(open) => !open && setReschedulingTask(null)}
        task={reschedulingTask}
      />
    </div>
  );
}
