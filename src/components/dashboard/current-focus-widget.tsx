'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/types';
import { useAppStore } from '@/lib/store/app-store';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from '@/components/tasks/priority-badge';
import { formatMinutesHuman, timeStringToMinutes } from '@/lib/utils/time';
import { Compass, Play, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

interface Props {
  todayTasks: Task[];
  onQuickStart?: (taskId: string) => void;
}

export function CurrentFocusWidget({ todayTasks }: Props) {
  const { activeTask, startTimer } = useAppStore();
  const [currentMinutes, setCurrentMinutes] = useState<number>(540);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Find if a task is scheduled for right now
  const currentHourTask = todayTasks.find((t) => {
    if (!t.start_time || t.status === 'completed' || t.status === 'cancelled') return false;
    const start = timeStringToMinutes(t.start_time);
    if (start === null) return false;
    const end = start + (t.estimated_duration || 30);
    return currentMinutes >= start && currentMinutes <= end;
  });

  // Next up task
  const nextScheduledTask = todayTasks.find((t) => {
    if (!t.start_time || t.status === 'completed' || t.status === 'cancelled') return false;
    const start = timeStringToMinutes(t.start_time);
    return start !== null && start > currentMinutes;
  });

  // Top pending task if no specific time scheduled
  const topPendingTask =
    currentHourTask ||
    nextScheduledTask ||
    todayTasks.find((t) => t.status === 'in_progress') ||
    todayTasks.find((t) => t.status === 'todo' && t.priority === 'urgent') ||
    todayTasks.find((t) => t.status === 'todo' && t.priority === 'high') ||
    todayTasks.find((t) => t.status === 'todo');

  return (
    <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-black text-white dark:bg-white dark:text-black p-1.5">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black dark:text-white">
              Current Hour Focus
            </h3>
            <p className="text-[11px] text-zinc-500">
              Answers: &quot;What should I work on right now?&quot;
            </p>
          </div>
        </div>

        <Link
          href="/planner"
          className="text-xs font-semibold text-black dark:text-white hover:underline flex items-center gap-1"
        >
          <span>Open Planner</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {activeTask ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white p-3.5 shadow-xs border border-zinc-300 dark:border-zinc-800 dark:bg-black">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-black dark:bg-white animate-pulse" />
              In Progress Right Now
            </span>
            <h4 className="text-sm font-bold text-black dark:text-white truncate">
              {activeTask.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock className="h-3 w-3" />
              <span>Est: {formatMinutesHuman(activeTask.estimated_duration)}</span>
            </div>
          </div>
          <Link href="/timer">
            <Button size="sm" className="gap-1.5 text-xs font-semibold">
              View Active Timer
            </Button>
          </Link>
        </div>
      ) : topPendingTask ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white p-3.5 shadow-xs border border-zinc-200 dark:border-zinc-800 dark:bg-black">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                {currentHourTask
                  ? 'Scheduled For This Hour'
                  : nextScheduledTask
                  ? `Next Scheduled: ${nextScheduledTask.start_time?.slice(0, 5)}`
                  : 'Recommended Next Task'}
              </span>
              <PriorityBadge priority={topPendingTask.priority} />
            </div>
            <h4 className="text-sm font-bold text-black dark:text-white truncate">
              {topPendingTask.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock className="h-3 w-3" />
              <span>Duration: {formatMinutesHuman(topPendingTask.estimated_duration)}</span>
              {topPendingTask.start_time && (
                <span>• Scheduled at {topPendingTask.start_time.slice(0, 5)}</span>
              )}
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => startTimer(topPendingTask.id)}
            className="gap-1.5 text-xs font-semibold shrink-0"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Start Working</span>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl bg-white p-4 text-center dark:bg-black border border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            All scheduled tasks for today are completed.
          </p>
        </div>
      )}
    </div>
  );
}
