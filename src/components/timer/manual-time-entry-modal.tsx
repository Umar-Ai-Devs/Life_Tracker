'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store/app-store';
import { Clock, PlusCircle } from 'lucide-react';
import { getTodayDateString } from '@/lib/utils/time';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTaskId?: string;
}

export function ManualTimeEntryModal({ open, onOpenChange, defaultTaskId }: Props) {
  const { tasks, logManualTime } = useAppStore();

  const [taskId, setTaskId] = useState(defaultTaskId || tasks[0]?.id || '');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('2026-10-12');
  React.useEffect(() => {
    setDate(getTodayDateString());
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || durationMinutes <= 0) return;

    setIsSubmitting(true);
    try {
      await logManualTime(taskId, durationMinutes, notes.trim(), date);
      onOpenChange(false);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black dark:text-white">
            <PlusCircle className="h-5 w-5 text-black dark:text-white" />
            Manually Log Work Time
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1">
              Select Task
            </label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-black dark:text-white mb-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black dark:text-white mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black dark:text-white mb-1">
              Work Notes / Summary (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Debugged caching issue, deployed patch"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white resize-none focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
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
              Add Time Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
