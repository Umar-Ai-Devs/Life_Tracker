'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  formatSecondsToStopwatch,
  formatMinutesHuman,
  formatSecondsHuman,
  hasExceededEstimate,
} from '@/lib/utils/time';
import {
  Pause,
  Square,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export function ActiveTimerWidget() {
  const { activeTimer, activeTask, pauseTimer, stopTimer, markTaskComplete } = useAppStore();

  if (!activeTimer || !activeTask) {
    return (
      <Card className="border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
            <Clock className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-black dark:text-white">
            No active timer running
          </h4>
          <p className="text-xs text-zinc-500 max-w-xs mt-1">
            Select any planned or inbox task and hit &quot;Start&quot; to begin tracking your focused session.
          </p>
        </CardContent>
      </Card>
    );
  }

  const liveActualSeconds = (activeTask.actual_duration || 0) + activeTimer.elapsedSeconds;
  const estimatedSeconds = (activeTask.estimated_duration || 30) * 60;
  const exceeded = hasExceededEstimate(activeTask.estimated_duration, liveActualSeconds);
  const remainingSeconds = Math.max(0, estimatedSeconds - liveActualSeconds);
  const progressPercent = Math.min(100, Math.round((liveActualSeconds / estimatedSeconds) * 100));

  return (
    <Card className="border border-black dark:border-white bg-white dark:bg-black shadow-md">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-black dark:bg-white animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-black dark:text-white">
                Active Session
              </span>
              {activeTask.category && (
                <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium border border-zinc-300 dark:border-zinc-700">
                  {activeTask.category.name}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-black dark:text-white truncate">
              {activeTask.title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap pt-0.5">
              <span>Est: {formatMinutesHuman(activeTask.estimated_duration)}</span>
              <span>•</span>
              <span className={exceeded ? 'text-black dark:text-white font-bold' : ''}>
                Total logged: {formatSecondsHuman(liveActualSeconds)}
              </span>
              <span>•</span>
              {exceeded ? (
                <span className="flex items-center gap-1 font-bold text-black dark:text-white">
                  <AlertTriangle className="h-3 w-3" /> Over estimated time
                </span>
              ) : (
                <span className="text-zinc-500">
                  Remaining: {formatSecondsHuman(remainingSeconds)}
                </span>
              )}
            </div>
          </div>

          {/* Stopwatch & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            <div className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-black dark:text-white tabular-nums">
              {formatSecondsToStopwatch(liveActualSeconds)}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={pauseTimer}
                className="gap-1.5"
              >
                <Pause className="h-3.5 w-3.5 fill-current" />
                Pause
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={stopTimer}
                className="gap-1.5"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                Stop
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => markTaskComplete(activeTask.id, true)}
                className="gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Complete
              </Button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] font-mono text-zinc-500 mb-1">
            <span>Session Progress</span>
            <span>{progressPercent}% of {formatMinutesHuman(activeTask.estimated_duration)}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
