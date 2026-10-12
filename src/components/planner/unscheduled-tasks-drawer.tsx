'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { useAppStore } from '@/lib/store/app-store';
import { formatMinutesHuman } from '@/lib/utils/time';
import { Button } from '@/components/ui/button';
import { Clock, Plus, ArrowRight } from 'lucide-react';

interface Props {
  date: string;
  onScheduleTime: (task: Task) => void;
}

export function UnscheduledTasksDrawer({ date, onScheduleTime }: Props) {
  const { tasks, rescheduleTask } = useAppStore();

  // Tasks planned for this day but without a start_time
  const dayUnscheduled = tasks.filter(
    (t) => t.planned_date === date && !t.start_time && t.status !== 'completed' && t.status !== 'cancelled'
  );

  // General inbox tasks (no planned_date at all)
  const generalInbox = tasks.filter((t) => t.status === 'inbox' && !t.planned_date);

  const [activeTab, setActiveTab] = useState<'day' | 'inbox'>('day');

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black shadow-xs">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h3 className="text-sm font-bold text-black dark:text-white">
            Unscheduled Backlog
          </h3>
          <p className="text-[11px] text-zinc-500">
            Assign start times to fit into your hourly plan
          </p>
        </div>
        <div className="flex rounded-xl bg-zinc-100 p-0.5 dark:bg-zinc-900 text-[11px] font-semibold border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('day')}
            className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
              activeTab === 'day'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-zinc-500 hover:text-black dark:hover:text-white'
            }`}
          >
            Today ({dayUnscheduled.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inbox')}
            className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
              activeTab === 'inbox'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-zinc-500 hover:text-black dark:hover:text-white'
            }`}
          >
            Inbox ({generalInbox.length})
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {activeTab === 'day' && (
          <>
            {dayUnscheduled.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                All tasks for this day have assigned start times.
              </div>
            ) : (
              dayUnscheduled.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-3 hover:border-black dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-white transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-semibold text-black dark:text-white truncate">
                      {task.title}
                    </p>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-500 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {formatMinutesHuman(task.estimated_duration)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onScheduleTime(task)}
                    className="h-7 text-xs font-medium gap-1 shrink-0"
                  >
                    <span>Assign Time</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'inbox' && (
          <>
            {generalInbox.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                Your inbox is clear.
              </div>
            ) : (
              generalInbox.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-3 hover:border-black dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-white transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-semibold text-black dark:text-white truncate">
                      {task.title}
                    </p>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-500 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {formatMinutesHuman(task.estimated_duration)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="default"
                    onClick={async () => {
                      await rescheduleTask(task.id, date, null);
                    }}
                    className="h-7 text-xs font-medium gap-1 shrink-0"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Plan Today</span>
                  </Button>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
