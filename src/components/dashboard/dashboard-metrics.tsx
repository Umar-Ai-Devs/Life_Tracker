'use client';

import React from 'react';
import { DailySummary } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatMinutesHuman } from '@/lib/utils/time';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Hourglass,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

interface Props {
  summary: DailySummary;
}

export function DashboardMetrics({ summary }: Props) {
  const cards = [
    {
      title: "Today's Tasks",
      value: summary.totalTasks,
      subtext: `${summary.pendingTasks} pending, ${summary.inProgressTasks} active`,
      icon: CalendarCheck,
    },
    {
      title: 'Completed',
      value: `${summary.completedTasks} / ${summary.totalTasks}`,
      subtext: `${summary.completionRate}% completion rate`,
      icon: CheckCircle2,
    },
    {
      title: 'Estimated Workload',
      value: formatMinutesHuman(summary.totalEstimatedMinutes),
      subtext: 'Planned duration for today',
      icon: Clock,
    },
    {
      title: 'Actual Time Spent',
      value: formatMinutesHuman(summary.totalActualMinutes),
      subtext: 'Recorded via active & manual logs',
      icon: TrendingUp,
    },
    {
      title: 'Remaining Workload',
      value: formatMinutesHuman(summary.remainingWorkloadMinutes),
      subtext: 'Pending estimated time',
      icon: Hourglass,
    },
    {
      title: 'Overdue Warnings',
      value: summary.overdueTasks,
      subtext: summary.overdueTasks > 0 ? 'Passed deadline' : 'All deadlines on track',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Card key={i} className="hover:border-black dark:hover:border-white transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-zinc-500 truncate">
                  {card.title}
                </span>
                <div className="rounded-lg p-1.5 bg-zinc-100 text-black dark:bg-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white">
                {card.value}
              </div>
              <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                {card.subtext}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
