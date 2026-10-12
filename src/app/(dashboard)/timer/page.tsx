'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { ActiveTimerWidget } from '@/components/timer/active-timer-widget';
import { ManualTimeEntryModal } from '@/components/timer/manual-time-entry-modal';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  formatMinutesHuman,
  formatSecondsHuman,
  hasExceededEstimate,
} from '@/lib/utils/time';
import {
  PlusCircle,
  History,
  Clock,
  Play,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

export default function TimeTrackingPage() {
  const { tasks, timeEntries, startTimer, activeTimer } = useAppStore();
  const [showManualModal, setShowManualModal] = useState(false);

  // Filter tasks that have logged time or are in progress
  const activeAndTrackedTasks = tasks.filter(
    (t) => (t.actual_duration || 0) > 0 || t.status === 'in_progress' || activeTimer?.taskId === t.id
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white flex items-center gap-2">
            Time Tracking Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Track focused task sessions, monitor estimated vs actual hours, and log past work.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowManualModal(true)}
          className="gap-1.5 text-xs font-semibold"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Log Manual Time</span>
        </Button>
      </div>

      {/* Main Active Timer Card */}
      <ActiveTimerWidget />

      {/* Two Column Grid: Task Duration Summaries & Recent Session History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Duration vs Estimate Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-black dark:text-white">
              <Clock className="h-4 w-4" />
              <span>Tracked Tasks Overview</span>
            </CardTitle>
            <p className="text-xs text-zinc-500">
              Compare estimated allowances against real cumulative time
            </p>
          </CardHeader>

          <CardContent>
            {activeAndTrackedTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No tracked tasks yet. Start a timer from any task card or click &quot;Log Manual Time&quot;.
              </div>
            ) : (
              <div className="space-y-3">
                {activeAndTrackedTasks.map((task) => {
                  const isRunning = activeTimer?.taskId === task.id;
                  const liveSec = (task.actual_duration || 0) + (isRunning ? activeTimer.elapsedSeconds : 0);
                  const estSec = (task.estimated_duration || 30) * 60;
                  const exceeded = hasExceededEstimate(task.estimated_duration, liveSec);
                  const percent = Math.min(100, Math.round((liveSec / estSec) * 100));

                  return (
                    <div
                      key={task.id}
                      className={`rounded-xl border p-3 transition-all ${
                        isRunning
                          ? 'border-black bg-zinc-100 ring-1 ring-black dark:border-white dark:bg-zinc-900 dark:ring-white'
                          : 'border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-black dark:text-white truncate">
                            {task.title}
                          </h4>
                          <span className="text-[11px] text-zinc-500">
                            Est: {formatMinutesHuman(task.estimated_duration)}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono text-xs font-bold text-black dark:text-white">
                            {formatSecondsHuman(liveSec)}
                          </div>
                          {exceeded && (
                            <span className="text-[10px] font-bold text-black dark:text-white flex items-center justify-end gap-0.5">
                              <AlertTriangle className="h-2.5 w-2.5" /> Exceeded
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-black dark:bg-white rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500">{percent}%</span>

                        {!isRunning && task.status !== 'completed' && (
                          <Button
                            size="iconSm"
                            variant="ghost"
                            aria-label={`Start timer for ${task.title}`}
                            onClick={() => startTimer(task.id)}
                            className="h-6 w-6 text-black dark:text-white"
                          >
                            <Play className="h-3 w-3 fill-current" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recorded Time Sessions History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-black dark:text-white">
              <History className="h-4 w-4" />
              <span>Session History Log</span>
            </CardTitle>
            <p className="text-xs text-zinc-500">
              Chronological records saved in database
            </p>
          </CardHeader>

          <CardContent>
            {timeEntries.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No recorded work sessions yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {timeEntries.map((entry) => {
                  const task = tasks.find((t) => t.id === entry.task_id);
                  const isOngoing = !entry.end_time;
                  const durationSec = entry.duration || 0;

                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-950 text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-semibold text-black dark:text-white truncate">
                          {task?.title || 'Unknown Task'}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(entry.start_time).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>{new Date(entry.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {entry.notes && (
                            <>
                              <span>•</span>
                              <span className="italic truncate max-w-[120px]">{entry.notes}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right font-mono">
                        {isOngoing ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-black dark:border-white px-2 py-0.5 text-[10px] font-bold text-black dark:text-white animate-pulse">
                            Running
                          </span>
                        ) : (
                          <span className="font-bold text-black dark:text-white">
                            {formatSecondsHuman(durationSec)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manual Time Entry Modal */}
      <ManualTimeEntryModal
        open={showManualModal}
        onOpenChange={setShowManualModal}
      />
    </div>
  );
}
