'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Task, Priority, TaskStatus } from '@/types';
import { useAppStore } from '@/lib/store/app-store';
import { Clock, Calendar, Tag, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { getTodayDateString } from '@/lib/utils/time';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskToEdit?: Task | null;
  defaultDate?: string | null;
}

export function TaskFormModal({ open, onOpenChange, taskToEdit, defaultDate }: Props) {
  const { createTask, updateTask, categories } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estHours, setEstHours] = useState(0);
  const [estMinutes, setEstMinutes] = useState(30);
  const [plannedDate, setPlannedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [categoryId, setCategoryId] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus>('inbox');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      const totalMin = taskToEdit.estimated_duration || 30;
      setEstHours(Math.floor(totalMin / 60));
      setEstMinutes(totalMin % 60);
      setPlannedDate(taskToEdit.planned_date || '');
      setStartTime(taskToEdit.start_time || '');
      setDeadline(taskToEdit.deadline ? taskToEdit.deadline.slice(0, 16) : '');
      setPriority(taskToEdit.priority || 'medium');
      setCategoryId(taskToEdit.category_id || '');
      setStatus(taskToEdit.status || 'inbox');
    } else {
      // Defaults for new task
      setTitle('');
      setDescription('');
      setEstHours(0);
      setEstMinutes(30);
      setPlannedDate(defaultDate || '');
      setStartTime('');
      setDeadline('');
      setPriority('medium');
      setCategoryId(categories[0]?.id || '');
      setStatus(defaultDate ? 'todo' : 'inbox');
    }
    setError('');
  }, [taskToEdit, defaultDate, open, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    const totalEstDuration = Math.max(5, estHours * 60 + estMinutes);

    setIsSubmitting(true);
    try {
      const taskPayload = {
        title: title.trim(),
        description: description.trim() || null,
        estimated_duration: totalEstDuration,
        planned_date: plannedDate ? plannedDate : null,
        start_time: startTime ? startTime : null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        priority,
        category_id: categoryId || null,
        status,
      };

      if (taskToEdit) {
        await updateTask(taskToEdit.id, taskPayload);
      } else {
        await createTask(taskPayload);
      }

      onOpenChange(false);
    } catch (err: unknown) {
      console.error(err);
      setError('An error occurred while saving the task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black dark:text-white">
            {taskToEdit ? 'Edit Task' : 'Quick Capture Task'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-3 text-xs text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-black dark:text-white" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1.5">
              Task Title <span className="text-black dark:text-white">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Prepare quarterly financial model"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-black placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:ring-white"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Description & Notes
            </label>
            <textarea
              rows={2}
              placeholder="Key deliverables, sub-steps, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-sm text-black placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:ring-white resize-none"
            />
          </div>

          {/* Estimated Duration */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
            <label className="block text-xs font-semibold text-black dark:text-white mb-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-black dark:text-white" /> Estimated Duration
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="48"
                  value={estHours}
                  onChange={(e) => setEstHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-center font-mono dark:border-zinc-800 dark:bg-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
                <span className="text-xs text-zinc-500 font-medium">hours</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={estMinutes}
                  onChange={(e) => setEstMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-16 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-center font-mono dark:border-zinc-800 dark:bg-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
                <span className="text-xs text-zinc-500 font-medium">mins</span>
              </div>
              <div className="ml-auto flex gap-1">
                <button
                  type="button"
                  onClick={() => { setEstHours(0); setEstMinutes(25); }}
                  className="rounded-lg border border-zinc-300 bg-zinc-100 px-2 py-1 text-[11px] font-medium text-black hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 cursor-pointer"
                >
                  25m
                </button>
                <button
                  type="button"
                  onClick={() => { setEstHours(0); setEstMinutes(45); }}
                  className="rounded-lg border border-zinc-300 bg-zinc-100 px-2 py-1 text-[11px] font-medium text-black hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 cursor-pointer"
                >
                  45m
                </button>
                <button
                  type="button"
                  onClick={() => { setEstHours(1); setEstMinutes(0); }}
                  className="rounded-lg border border-zinc-300 bg-zinc-100 px-2 py-1 text-[11px] font-medium text-black hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 cursor-pointer"
                >
                  1h
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Date & Start Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-black dark:text-white mb-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Planned Date
              </label>
              <div className="flex gap-1.5">
                <input
                  type="date"
                  value={plannedDate}
                  onChange={(e) => {
                    setPlannedDate(e.target.value);
                    if (e.target.value && status === 'inbox') setStatus('todo');
                  }}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const today = getTodayDateString();
                    setPlannedDate(today);
                    if (status === 'inbox') setStatus('todo');
                  }}
                  className="shrink-0 rounded-xl border border-zinc-300 bg-zinc-100 px-2 text-[11px] font-medium text-black hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Today
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-black dark:text-white mb-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Start Time (Optional)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-black dark:text-white mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-black dark:text-white mb-1 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-black dark:text-white mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              >
                <option value="inbox">Inbox (Unscheduled)</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-black dark:text-white mb-1">
                Deadline (Optional)
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
