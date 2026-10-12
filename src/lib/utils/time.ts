/**
 * Formats duration in seconds to standard stopwatch format: HH:MM:SS
 */
export function formatSecondsToStopwatch(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = safeSec % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Formats minutes into human-friendly format: "1h 30m" or "45m"
 */
export function formatMinutesHuman(minutes: number): string {
  const safeMin = Math.max(0, Math.round(minutes));
  const hrs = Math.floor(safeMin / 60);
  const mins = safeMin % 60;

  if (hrs > 0 && mins > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (hrs > 0) {
    return `${hrs}h`;
  }
  return `${mins}m`;
}

/**
 * Formats seconds into human-friendly format: "1h 30m" or "< 1m"
 */
export function formatSecondsHuman(seconds: number): string {
  if (seconds < 60 && seconds > 0) return `${Math.round(seconds)}s`;
  return formatMinutesHuman(seconds / 60);
}

/**
 * Converts HH:MM string into minutes since midnight
 */
export function timeStringToMinutes(timeStr?: string | null): number | null {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

/**
 * Converts minutes since midnight back to HH:MM format
 */
export function minutesToTimeString(minutes: number): string {
  const norm = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Determines if a task is overdue
 */
export function isTaskOverdue(deadline?: string | null, status?: string): boolean {
  if (!deadline || status === 'completed' || status === 'cancelled') return false;
  const deadlineDate = new Date(deadline);
  return deadlineDate.getTime() < Date.now();
}

/**
 * Checks if a task has exceeded its estimated duration
 */
export function hasExceededEstimate(estimatedMinutes: number, actualSeconds: number): boolean {
  return actualSeconds > estimatedMinutes * 60;
}

/**
 * Calculates percentage of estimated duration used
 */
export function getDurationPercentage(estimatedMinutes: number, actualSeconds: number): number {
  if (estimatedMinutes <= 0) return 0;
  const estimatedSec = estimatedMinutes * 60;
  return Math.min(100, Math.round((actualSeconds / estimatedSec) * 100));
}

/**
 * Formats standard date string YYYY-MM-DD to friendly string like "Monday, Oct 12"
 */
export function formatFriendlyDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Gets today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
