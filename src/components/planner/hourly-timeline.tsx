'use client';

import React, { useEffect, useState } from 'react';
import { Task } from '@/types';
import { useAppStore } from '@/lib/store/app-store';
import { timeStringToMinutes, formatMinutesHuman, formatSecondsHuman } from '@/lib/utils/time';
import { Play, Pause, Clock, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  date: string;
  tasks: Task[];
  onSlotClick?: (timeStr: string) => void;
  onEditTask?: (task: Task) => void;
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 to 23:00

export function HourlyTimeline({ date, tasks, onSlotClick, onEditTask }: Props) {
  const { activeTimer, startTimer, pauseTimer, markTaskComplete } = useAppStore();
  const [currentMinutesFromMidnight, setCurrentMinutesFromMidnight] = useState<number>(0);
  const [isCurrentDay, setIsCurrentDay] = useState(false);

  // Update current time indicator
  useEffect(() => {
    const updateNow = () => {
      const now = new Date();
      setCurrentMinutesFromMidnight(now.getHours() * 60 + now.getMinutes());
      const yr = now.getFullYear();
      const mo = (now.getMonth() + 1).toString().padStart(2, '0');
      const dy = now.getDate().toString().padStart(2, '0');
      setIsCurrentDay(`${yr}-${mo}-${dy}` === date);
    };
    updateNow();
    const interval = setInterval(updateNow, 60000);
    return () => clearInterval(interval);
  }, [date]);

  // Filter tasks that have scheduled start times
  const scheduledTasks = tasks.filter((t) => Boolean(t.start_time));

  const showNowIndicator = isCurrentDay && currentMinutesFromMidnight >= 360 && currentMinutesFromMidnight <= 1440;
  // Position from 06:00 (360 min) where each hour is 80px high => (now - 360) * (80 / 60)
  const nowIndicatorTop = Math.max(0, (currentMinutesFromMidnight - 360) * (80 / 60));

  return (
    <div className="relative rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black shadow-xs">
      <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-black dark:text-white">
            Hourly Schedule & Time Blocking
          </h3>
          <p className="text-xs text-zinc-500">
            Visual breakdown of planned hours, current focus, and available gaps.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm border border-black bg-white dark:border-white dark:bg-black" /> Planned
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-black dark:bg-white" /> Active
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-zinc-300 dark:bg-zinc-700" /> Done
          </span>
        </div>
      </div>

      <div className="relative min-w-[500px]">
        {/* Current Time Indicator Line */}
        {showNowIndicator && (
          <div
            className="absolute left-16 right-0 z-30 flex items-center pointer-events-none transition-all duration-500"
            style={{ top: `${nowIndicatorTop}px` }}
          >
            <div className="flex h-4 items-center rounded-sm bg-black text-white dark:bg-white dark:text-black px-1.5 text-[10px] font-bold">
              NOW
            </div>
            <div className="h-0.5 flex-1 bg-black dark:bg-white" />
          </div>
        )}

        {/* Timeline Grid */}
        <div className="relative space-y-0">
          {HOURS.map((hour) => {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const hourStartMin = hour * 60;
            const hourEndMin = hourStartMin + 60;

            // Find tasks that start in this hour
            const hourTasks = scheduledTasks.filter((t) => {
              const startMin = timeStringToMinutes(t.start_time);
              return startMin !== null && startMin >= hourStartMin && startMin < hourEndMin;
            });

            return (
              <div
                key={hour}
                className="group relative flex h-20 border-b border-zinc-100 dark:border-zinc-900 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-950"
              >
                {/* Hour Label */}
                <div className="w-16 shrink-0 pr-3 pt-1 text-right font-mono text-xs font-semibold text-zinc-400 select-none">
                  {timeStr}
                </div>

                {/* Slot Content */}
                <div className="relative flex-1 pl-3">
                  {/* Empty slot quick-add hover button */}
                  {hourTasks.length === 0 && (
                    <button
                      type="button"
                      onClick={() => onSlotClick && onSlotClick(timeStr)}
                      className="absolute inset-x-2 inset-y-1.5 flex items-center justify-start rounded-xl border border-dashed border-transparent px-3 text-xs text-zinc-400 opacity-0 transition-all hover:border-zinc-300 hover:bg-zinc-100/60 hover:text-black group-hover:opacity-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer"
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Schedule task at {timeStr}
                    </button>
                  )}

                  {/* Render Tasks starting in this hour */}
                  <div className="flex flex-col gap-1.5 pt-1 pr-2">
                    {hourTasks.map((task) => {
                      const isCurrentRunning = activeTimer?.taskId === task.id;
                      const isCompleted = task.status === 'completed';

                      return (
                        <div
                          key={task.id}
                          className={`relative z-20 flex items-center justify-between rounded-xl border p-2.5 shadow-2xs transition-all ${
                            isCurrentRunning
                              ? 'border-black bg-zinc-100 ring-1 ring-black dark:border-white dark:bg-zinc-900 dark:ring-white'
                              : isCompleted
                              ? 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 opacity-60'
                              : 'border-zinc-300 bg-white hover:border-black dark:border-zinc-700 dark:bg-black dark:hover:border-white'
                          }`}
                        >
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => onEditTask && onEditTask(task)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-black dark:text-white">
                                {task.start_time?.slice(0, 5)}
                              </span>
                              <span
                                className={`text-xs font-semibold truncate ${
                                  isCompleted
                                    ? 'line-through text-zinc-400 dark:text-zinc-600'
                                    : 'text-black dark:text-white'
                                }`}
                              >
                                {task.title}
                              </span>

                              {task.category && (
                                <span className="rounded border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                                  {task.category.name}
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="h-3 w-3" />
                                {formatMinutesHuman(task.estimated_duration)}
                              </span>
                              <span>•</span>
                              <span>
                                Logged: {formatSecondsHuman(task.actual_duration || 0)}
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions in Timeline block */}
                          <div className="flex items-center gap-1.5 ml-2">
                            {!isCompleted && (
                              <Button
                                size="iconSm"
                                variant={isCurrentRunning ? 'default' : 'outline'}
                                aria-label={isCurrentRunning ? "Pause timer" : "Start timer"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isCurrentRunning) pauseTimer();
                                  else startTimer(task.id);
                                }}
                              >
                                {isCurrentRunning ? (
                                  <Pause className="h-3 w-3 fill-current" />
                                ) : (
                                  <Play className="h-3 w-3 fill-current" />
                                )}
                              </Button>
                            )}

                            <Button
                              size="iconSm"
                              variant={isCompleted ? 'default' : 'ghost'}
                              aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                              onClick={(e) => {
                                e.stopPropagation();
                                markTaskComplete(task.id, !isCompleted);
                              }}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
