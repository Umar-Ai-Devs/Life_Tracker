'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { Button } from '@/components/ui/button';
import { formatSecondsToStopwatch, hasExceededEstimate } from '@/lib/utils/time';
import { Pause, Square, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export function GlobalActiveTimerBanner() {
  const { activeTimer, activeTask, pauseTimer, stopTimer } = useAppStore();

  if (!activeTimer || !activeTask) return null;

  const liveActual = (activeTask.actual_duration || 0) + activeTimer.elapsedSeconds;
  const exceeded = hasExceededEstimate(activeTask.estimated_duration, liveActual);

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between border-b border-black dark:border-white bg-black dark:bg-white px-4 py-2 text-white dark:text-black shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white dark:bg-black opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white dark:bg-black" />
        </span>

        <span className="text-xs font-mono font-bold tracking-wider hidden sm:inline">
          TRACKING:
        </span>

        <Link
          href="/timer"
          className="text-xs font-semibold hover:underline truncate max-w-[200px] sm:max-w-xs md:max-w-md"
        >
          {activeTask.title}
        </Link>

        {exceeded && (
          <span className="inline-flex items-center gap-1 rounded border border-white dark:border-black px-1.5 py-0.2 text-[10px] font-bold">
            <AlertTriangle className="h-2.5 w-2.5" /> Overtime
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="font-mono text-sm sm:text-base font-black tabular-nums">
          {formatSecondsToStopwatch(liveActual)}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="iconSm"
            variant="ghost"
            onClick={pauseTimer}
            title="Pause timer"
            aria-label="Pause timer"
            className="text-white hover:bg-zinc-800 dark:text-black dark:hover:bg-zinc-200"
          >
            <Pause className="h-3.5 w-3.5 fill-current" />
          </Button>
          <Button
            size="iconSm"
            variant="ghost"
            onClick={stopTimer}
            title="Stop timer"
            aria-label="Stop timer"
            className="text-white hover:bg-zinc-800 dark:text-black dark:hover:bg-zinc-200"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}
