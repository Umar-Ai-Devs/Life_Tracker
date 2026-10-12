import { Task } from '@/types';
import { timeStringToMinutes } from './time';

export interface ScheduleConflict {
  taskA: Task;
  taskB: Task;
  overlapMinutes: number;
}

/**
 * Checks for overlapping tasks scheduled on the same date with start times
 */
export function detectScheduleConflicts(tasks: Task[]): ScheduleConflict[] {
  const scheduledTasks = tasks.filter(
    (t) => t.start_time && t.status !== 'completed' && t.status !== 'cancelled'
  );

  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < scheduledTasks.length; i++) {
    const taskA = scheduledTasks[i];
    const startA = timeStringToMinutes(taskA.start_time);
    if (startA === null) continue;
    const endA = startA + (taskA.estimated_duration || 30);

    for (let j = i + 1; j < scheduledTasks.length; j++) {
      const taskB = scheduledTasks[j];
      const startB = timeStringToMinutes(taskB.start_time);
      if (startB === null) continue;
      const endB = startB + (taskB.estimated_duration || 30);

      // Overlap condition: startA < endB && startB < endA
      if (startA < endB && startB < endA) {
        const overlapStart = Math.max(startA, startB);
        const overlapEnd = Math.min(endA, endB);
        conflicts.push({
          taskA,
          taskB,
          overlapMinutes: overlapEnd - overlapStart,
        });
      }
    }
  }

  return conflicts;
}
