'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { ProductivityCharts } from '@/components/reports/productivity-charts';
import { formatMinutesHuman } from '@/lib/utils/time';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  PieChart,
} from 'lucide-react';

export default function ReportsPage() {
  const { tasks, categories, timeEntries } = useAppStore();

  // Calculate Estimation Accuracy Score
  // Compares tasks that have both an estimate and actual recorded time
  const accuracyStats = React.useMemo(() => {
    const finishedWithTime = tasks.filter(
      (t) => (t.actual_duration || 0) > 0 && t.estimated_duration > 0
    );

    if (finishedWithTime.length === 0) {
      return { ratioPercent: 100, overCount: 0, underCount: 0, perfectCount: 0 };
    }

    let totalEstSec = 0;
    let totalActSec = 0;
    let over = 0;
    let under = 0;
    let perfect = 0;

    finishedWithTime.forEach((t) => {
      const estSec = t.estimated_duration * 60;
      const actSec = t.actual_duration || 0;
      totalEstSec += estSec;
      totalActSec += actSec;

      if (actSec > estSec * 1.15) over++;
      else if (actSec < estSec * 0.85) under++;
      else perfect++;
    });

    const ratioPercent = totalEstSec > 0 ? Math.round((totalActSec / totalEstSec) * 100) : 100;

    return {
      ratioPercent,
      overCount: over,
      underCount: under,
      perfectCount: perfect,
      totalCount: finishedWithTime.length,
    };
  }, [tasks]);

  const totalActualMinutes = Math.round(
    tasks.reduce((acc, t) => acc + (t.actual_duration || 0), 0) / 60
  );
  const totalCompleted = tasks.filter((t) => t.status === 'completed').length;
  const overallRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white flex items-center gap-2">
          Productivity & Time Insights
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Answers: &quot;How effectively am I using my time and how accurately do I estimate tasks?&quot;
        </p>
      </div>

      {/* High Level KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-100 p-3 text-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Total Time Tracked
              </span>
              <div className="text-xl font-black text-black dark:text-white">
                {formatMinutesHuman(totalActualMinutes)}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Across {timeEntries.length} logged sessions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-100 p-3 text-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Overall Completion Rate
              </span>
              <div className="text-xl font-black text-black dark:text-white">
                {overallRate}%
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {totalCompleted} of {tasks.length} total tasks done
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-100 p-3 text-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Estimation Calibration
              </span>
              <div className="text-xl font-black text-black dark:text-white">
                {accuracyStats.ratioPercent}%
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {accuracyStats.ratioPercent > 100
                  ? 'Trending slightly over estimates'
                  : 'Tasks finished within estimates'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics */}
      <ProductivityCharts
        tasks={tasks}
        categories={categories}
        timeEntries={timeEntries}
      />
    </div>
  );
}
