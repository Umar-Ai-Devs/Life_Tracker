'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { getTodayDateString, formatFriendlyDate, formatMinutesHuman } from '@/lib/utils/time';
import { HourlyTimeline } from '@/components/planner/hourly-timeline';
import { UnscheduledTasksDrawer } from '@/components/planner/unscheduled-tasks-drawer';
import { ScheduleConflictBanner } from '@/components/planner/schedule-conflict-banner';
import { detectScheduleConflicts } from '@/lib/utils/conflicts';
import { TaskFormModal } from '@/components/tasks/task-form-modal';
import { TaskRescheduleModal } from '@/components/tasks/task-reschedule-modal';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  Hourglass,
  Layers,
} from 'lucide-react';

export default function DailyPlannerPage() {
  const { tasks, getDailySummary } = useAppStore();

  const [selectedDate, setSelectedDate] = useState('2026-10-12');
  useEffect(() => {
    setSelectedDate(getTodayDateString());
  }, []);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [reschedulingTask, setReschedulingTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [defaultSlotTime, setDefaultSlotTime] = useState<string | null>(null);

  // Day navigation helpers
  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const yr = date.getFullYear();
    const mo = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    setSelectedDate(`${yr}-${mo}-${day}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const yr = date.getFullYear();
    const mo = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    setSelectedDate(`${yr}-${mo}-${day}`);
  };

  const handleToday = () => {
    setSelectedDate(getTodayDateString());
  };

  // Day specific tasks and metrics
  const dayTasks = tasks.filter((t) => t.planned_date === selectedDate);
  const daySummary = getDailySummary(selectedDate);
  const conflicts = detectScheduleConflicts(dayTasks);

  const handleSlotClick = (timeStr: string) => {
    setDefaultSlotTime(timeStr);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Date Header & Day Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Daily Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize your working hours, detect scheduling conflicts, and block out your day.
          </p>
        </div>

        {/* Navigation Toolbar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <Button
              size="iconSm"
              variant="ghost"
              onClick={handlePrevDay}
              aria-label="Previous day"
              title="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-black hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-900 rounded-lg cursor-pointer"
            >
              Today
            </button>

            <Button
              size="iconSm"
              variant="ghost"
              onClick={handleNextDay}
              aria-label="Next day"
              title="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="mx-1 h-4 w-px bg-slate-200 dark:bg-slate-800" />

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg bg-transparent px-2 py-1 text-xs font-mono font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            />
          </div>

          <Button
            size="sm"
            onClick={() => {
              setDefaultSlotTime(null);
              setShowAddModal(true);
            }}
            className="gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </div>
      </div>

      {/* Selected Day Stats Ribbon */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-black dark:text-white">
              Selected Schedule
            </span>
            <h2 className="text-lg font-bold text-black dark:text-white">
              {formatFriendlyDate(selectedDate)}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-500 block font-medium">Planned Tasks</span>
              <span className="font-bold text-black dark:text-white text-sm">
                {daySummary.completedTasks} / {daySummary.totalTasks} Done
              </span>
            </div>

            <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-500 block font-medium">Estimated Workload</span>
              <span className="font-bold text-black dark:text-white text-sm">
                {formatMinutesHuman(daySummary.totalEstimatedMinutes)}
              </span>
            </div>

            <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-500 block font-medium">Actual Logged</span>
              <span className="font-bold text-black dark:text-white text-sm">
                {formatMinutesHuman(daySummary.totalActualMinutes)}
              </span>
            </div>

            <div className="rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-500 block font-medium">Remaining Planned</span>
              <span className="font-bold text-black dark:text-white text-sm">
                {formatMinutesHuman(daySummary.remainingWorkloadMinutes)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Conflict Warning */}
      <ScheduleConflictBanner conflicts={conflicts} />

      {/* Main Split: Hourly Timeline on Left, Unscheduled Backlog on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 overflow-x-auto">
          <HourlyTimeline
            date={selectedDate}
            tasks={dayTasks}
            onSlotClick={handleSlotClick}
            onEditTask={setEditingTask}
          />
        </div>

        <div className="space-y-4">
          <UnscheduledTasksDrawer
            date={selectedDate}
            onScheduleTime={(task) => setReschedulingTask(task)}
          />
        </div>
      </div>

      {/* Modals */}
      <TaskFormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        defaultDate={selectedDate}
        taskToEdit={
          defaultSlotTime
            ? ({
                title: '',
                estimated_duration: 45,
                planned_date: selectedDate,
                start_time: defaultSlotTime,
                priority: 'medium',
                status: 'todo',
              } as any)
            : null
        }
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
