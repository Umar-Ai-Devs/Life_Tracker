'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Task } from '@/types';
import { useAppStore } from '@/lib/store/app-store';
import { Calendar, Clock, Inbox, CalendarDays } from 'lucide-react';
import { getTodayDateString } from '@/lib/utils/time';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export function TaskRescheduleModal({ open, onOpenChange, task }: Props) {
  const { rescheduleTask } = useAppStore();

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setDate(task.planned_date || '');
      setStartTime(task.start_time || '');
    }
  }, [task, open]);

  if (!task) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await rescheduleTask(task.id, date || null, startTime || null);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveToInbox = async () => {
    setIsSubmitting(true);
    try {
      await rescheduleTask(task.id, null, null);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleForToday = () => {
    setDate(getTodayDateString());
  };

  const handleScheduleForTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const yr = d.getFullYear();
    const mo = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    setDate(`${yr}-${mo}-${day}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black dark:text-white">
            <CalendarDays className="h-5 w-5 text-black dark:text-white" />
            Reschedule Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-semibold text-black dark:text-white">
              {task.title}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Current: {task.planned_date || 'Unscheduled'} {task.start_time ? `at ${task.start_time.slice(0, 5)}` : ''}
            </p>
          </div>

          {/* Quick presets */}
          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-2">
              Quick Actions
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleScheduleForToday}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white py-2 text-xs font-medium text-black hover:bg-zinc-100 dark:border-zinc-800 dark:bg-black dark:text-white dark:hover:bg-zinc-900 cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleScheduleForTomorrow}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white py-2 text-xs font-medium text-black hover:bg-zinc-100 dark:border-zinc-800 dark:bg-black dark:text-white dark:hover:bg-zinc-900 cursor-pointer"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={handleMoveToInbox}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-black bg-black py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 cursor-pointer"
              >
                <Inbox className="h-3.5 w-3.5" />
                To Inbox
              </button>
            </div>
          </div>

          {/* Specific Date & Time */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-black dark:text-white mb-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Select Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black dark:text-white mb-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Start Time (Optional)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
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
            <Button type="button" onClick={handleSave} disabled={isSubmitting}>
              Update Schedule
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
