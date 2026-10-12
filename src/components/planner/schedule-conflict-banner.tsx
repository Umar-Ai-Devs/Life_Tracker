'use client';

import React from 'react';
import { ScheduleConflict } from '@/lib/utils/conflicts';
import { AlertTriangle, Clock } from 'lucide-react';
import { formatMinutesHuman } from '@/lib/utils/time';

interface Props {
  conflicts: ScheduleConflict[];
  onResolve?: (taskAId: string, taskBId: string) => void;
}

export function ScheduleConflictBanner({ conflicts }: Props) {
  if (conflicts.length === 0) return null;

  return (
    <div className="mb-4 rounded-2xl border border-black dark:border-white bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-black dark:border-white p-2 text-black dark:text-white">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-black dark:text-white">
            {conflicts.length} Scheduling {conflicts.length === 1 ? 'Conflict' : 'Conflicts'} Detected
          </h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            The following tasks overlap in your hourly schedule. Consider rescheduling start times to avoid clashes.
          </p>

          <div className="mt-2.5 space-y-1.5">
            {conflicts.map((conflict, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black px-3 py-1.5 text-xs text-black dark:text-white"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    &quot;{conflict.taskA.title}&quot;
                  </span>
                  <span className="text-zinc-400">overlaps with</span>
                  <span className="font-bold">
                    &quot;{conflict.taskB.title}&quot;
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatMinutesHuman(conflict.overlapMinutes)} overlap
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
