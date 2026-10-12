'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskFormModal } from '@/components/tasks/task-form-modal';
import { TaskRescheduleModal } from '@/components/tasks/task-reschedule-modal';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getTodayDateString } from '@/lib/utils/time';
import {
  Inbox,
  Plus,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';

export function QuickCaptureBar() {
  const { createTask } = useAppStore();
  const [quickTitle, setQuickTitle] = useState('');
  const [estMinutes, setEstMinutes] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await createTask({
        title: quickTitle.trim(),
        estimated_duration: estMinutes,
        status: 'inbox',
        planned_date: null,
      });
      setQuickTitle('');
      setEstMinutes(30);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-center gap-2 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2.5 shadow-xs"
    >
      <div className="flex items-center gap-2 flex-1 w-full pl-2">
        <Zap className="h-4 w-4 text-black dark:text-white shrink-0" />
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Capture an unscheduled idea or task... (e.g. Call accountant)"
          className="w-full bg-transparent text-xs sm:text-sm text-black placeholder-zinc-400 focus:outline-none dark:text-white"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <div className="flex items-center gap-1 rounded-xl bg-white px-2 py-1 text-xs border border-zinc-200 dark:bg-black dark:border-zinc-800">
          <Clock className="h-3 w-3 text-zinc-500" />
          <input
            type="number"
            min="5"
            max="480"
            step="5"
            value={estMinutes}
            onChange={(e) => setEstMinutes(Math.max(5, parseInt(e.target.value) || 30))}
            className="w-10 bg-transparent text-center font-mono text-xs focus:outline-none text-black dark:text-white"
          />
          <span className="text-[10px] text-zinc-500">min</span>
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !quickTitle.trim()}
          className="gap-1 text-xs font-semibold h-8"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Capture</span>
        </Button>
      </div>
    </form>
  );
}

export default function InboxPage() {
  const { tasks, rescheduleTask } = useAppStore();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [reschedulingTask, setReschedulingTask] = useState<Task | null>(null);
  const [showDetailedModal, setShowDetailedModal] = useState(false);

  const inboxTasks = tasks.filter(
    (t) => t.status === 'inbox' || (!t.planned_date && t.status !== 'completed' && t.status !== 'cancelled')
  );

  const [todayStr, setTodayStr] = useState('2026-10-12');
  React.useEffect(() => {
    setTodayStr(getTodayDateString());
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white flex items-center gap-2">
            Task Inbox
            <span className="rounded-full border border-black dark:border-white px-2 py-0.5 text-xs font-bold text-black dark:text-white">
              {inboxTasks.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Capture everything instantly without having to decide a date yet. Organize & schedule when ready.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowDetailedModal(true)}
          variant="outline"
          className="gap-1.5 text-xs font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>Detailed Add</span>
        </Button>
      </div>

      {/* Instant 1-line Capture Bar */}
      <QuickCaptureBar />

      {/* Inbox List */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-black dark:text-white">
            <Inbox className="h-4 w-4" />
            <span>Unscheduled Backlog</span>
          </CardTitle>

          {inboxTasks.length > 0 && (
            <p className="text-xs text-zinc-500">
              Use &quot;Reschedule&quot; to assign into your daily calendar.
            </p>
          )}
        </CardHeader>

        <CardContent>
          {inboxTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-bold text-black dark:text-white">
                Inbox Zero
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
                No unscheduled tasks pending. Use the bar above to quickly dump new tasks as they occur to you.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inboxTasks.map((task) => (
                <div key={task.id} className="relative">
                  <TaskCard
                    task={task}
                    onEdit={setEditingTask}
                    onReschedule={setReschedulingTask}
                  />
                  {/* Quick move to Today button right below card */}
                  <div className="absolute right-14 top-4 sm:flex hidden items-center gap-1">
                    <button
                      type="button"
                      onClick={() => rescheduleTask(task.id, todayStr, null)}
                      className="rounded-lg border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white px-2 py-1 text-[11px] font-semibold text-black dark:text-white transition-colors cursor-pointer"
                    >
                      + Plan for Today
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <TaskFormModal
        open={showDetailedModal}
        onOpenChange={setShowDetailedModal}
        defaultDate={null}
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
