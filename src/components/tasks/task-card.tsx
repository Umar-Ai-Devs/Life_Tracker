'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { useAppStore } from '@/lib/store/app-store';
import { PriorityBadge } from './priority-badge';
import { TaskStatusBadge } from './task-status-badge';
import { Button } from '@/components/ui/button';
import {
  formatMinutesHuman,
  formatSecondsHuman,
  hasExceededEstimate,
  isTaskOverdue,
} from '@/lib/utils/time';
import {
  Play,
  Pause,
  Clock,
  Calendar,
  AlertTriangle,
  MoreVertical,
  Check,
  Edit2,
  Trash2,
  CalendarPlus,
} from 'lucide-react';

interface Props {
  task: Task;
  onEdit?: (task: Task) => void;
  onReschedule?: (task: Task) => void;
  compact?: boolean;
}

export function TaskCard({ task, onEdit, onReschedule, compact = false }: Props) {
  const {
    activeTimer,
    startTimer,
    pauseTimer,
    markTaskComplete,
    deleteTask,
  } = useAppStore();

  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isCurrentRunning = activeTimer?.taskId === task.id;
  const isCompleted = task.status === 'completed';
  const isOverdue = isTaskOverdue(task.deadline, task.status);

  // Live actual duration calculation
  const liveActualSeconds =
    (task.actual_duration || 0) + (isCurrentRunning ? activeTimer.elapsedSeconds : 0);

  const exceeded = hasExceededEstimate(task.estimated_duration, liveActualSeconds);
  const estimatedSeconds = (task.estimated_duration || 30) * 60;
  const remainingSeconds = Math.max(0, estimatedSeconds - liveActualSeconds);
  const progressPercent = Math.min(
    100,
    Math.round((liveActualSeconds / estimatedSeconds) * 100)
  );

  const handleToggleComplete = async () => {
    await markTaskComplete(task.id, !isCompleted);
  };

  const handleTimerClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentRunning) {
      await pauseTimer();
    } else {
      await startTimer(task.id);
    }
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    setShowConfirmDelete(false);
  };

  return (
    <div
      className={`group relative rounded-2xl border transition-all ${
        isCurrentRunning
          ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-950 shadow-sm ring-1 ring-black dark:ring-white'
          : exceeded && !isCompleted
          ? 'border-zinc-400 dark:border-zinc-600 bg-white dark:bg-black'
          : isCompleted
          ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 opacity-60'
          : 'border-zinc-200 bg-white hover:border-black dark:border-zinc-800 dark:bg-black dark:hover:border-white shadow-2xs'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Checkbox & Details */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={handleToggleComplete}
            aria-label={isCompleted ? "Mark task as incomplete" : "Mark task as complete"}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all cursor-pointer ${
              isCompleted
                ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                : 'border-zinc-400 bg-transparent hover:border-black dark:border-zinc-600 dark:hover:border-white'
            }`}
          >
            {isCompleted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4
                className={`text-sm font-semibold tracking-tight text-black dark:text-white truncate ${
                  isCompleted ? 'line-through text-zinc-400 dark:text-zinc-600' : ''
                }`}
                title={task.title}
              >
                {task.title}
              </h4>

              {task.category && (
                <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
                  {task.category.name}
                </span>
              )}

              <PriorityBadge priority={task.priority} />
              <TaskStatusBadge status={task.status} />

              {isOverdue && (
                <span className="inline-flex items-center gap-1 rounded-md border border-black dark:border-white px-1.5 py-0.5 text-[11px] font-semibold text-black dark:text-white">
                  <AlertTriangle className="h-3 w-3" /> Overdue
                </span>
              )}
            </div>

            {task.description && !compact && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-2">
                {task.description}
              </p>
            )}

            {/* Time and Planning Meta */}
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
              {task.planned_date && (
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="h-3 w-3" />
                  {task.planned_date}
                  {task.start_time && ` at ${task.start_time.slice(0, 5)}`}
                </span>
              )}

              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="h-3 w-3" />
                Est: {formatMinutesHuman(task.estimated_duration)}
              </span>

              <span
                className={`flex items-center gap-1 font-mono text-[11px] ${
                  exceeded ? 'font-bold text-black dark:text-white' : ''
                }`}
              >
                Actual: {formatSecondsHuman(liveActualSeconds)}
                {exceeded && (
                  <span title="Exceeded estimated time">
                    <AlertTriangle className="h-3 w-3 shrink-0 inline ml-0.5" />
                  </span>
                )}
              </span>

              {!isCompleted && !exceeded && remainingSeconds > 0 && (
                <span className="text-[11px] text-zinc-400">
                  Rem: {formatSecondsHuman(remainingSeconds)}
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-black dark:bg-white rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isCompleted && (
            <Button
              size="sm"
              variant={isCurrentRunning ? 'default' : 'outline'}
              onClick={handleTimerClick}
              className="h-8 gap-1.5 px-2.5 text-xs font-semibold"
            >
              {isCurrentRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Start</span>
                </>
              )}
            </Button>
          )}

          {/* Context Options */}
          <div className="relative">
            <Button
              size="iconSm"
              variant="ghost"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Open task options menu"
              className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl dark:border-zinc-800 dark:bg-black animate-in fade-in zoom-in-95 duration-100">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(task);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-black hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-900 cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit Task
                    </button>
                  )}
                  {onReschedule && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onReschedule(task);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-black hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-900 cursor-pointer"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" />
                      Reschedule
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowConfirmDelete(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-900 cursor-pointer border-t border-zinc-100 dark:border-zinc-900 mt-1 pt-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Task
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-300 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-black">
            <h3 className="text-base font-bold text-black dark:text-white mb-2">
              Delete Task?
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
              Are you sure you want to permanently delete &quot;{task.title}&quot;? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
