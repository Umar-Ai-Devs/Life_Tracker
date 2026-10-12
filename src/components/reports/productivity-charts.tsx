'use client';

import React, { useState, useEffect } from 'react';
import { Task, Category, TimeEntry } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatMinutesHuman } from '@/lib/utils/time';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface Props {
  tasks: Task[];
  categories: Category[];
  timeEntries: TimeEntry[];
}

export function ProductivityCharts({ tasks, categories }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Weekly estimated vs actual minutes (last 7 days)
  const last7DaysData = React.useMemo(() => {
    if (!mounted) return [];
    const days: { day: string; dateStr: string; estimated: number; actual: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const yr = d.getFullYear();
      const mo = (d.getMonth() + 1).toString().padStart(2, '0');
      const dayNum = d.getDate().toString().padStart(2, '0');
      const dateStr = `${yr}-${mo}-${dayNum}`;
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayTasks = tasks.filter((t) => t.planned_date === dateStr);
      const estMin = dayTasks.reduce((acc, t) => acc + (t.estimated_duration || 0), 0);
      const actMin = Math.round(
        dayTasks.reduce((acc, t) => acc + (t.actual_duration || 0), 0) / 60
      );

      days.push({
        day: dayLabel,
        dateStr,
        estimated: estMin,
        actual: actMin,
      });
    }

    return days;
  }, [tasks, mounted]);

  // 2. Time spent by category in greyscale shades
  const categoryData = React.useMemo(() => {
    const shades = ['#000000', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8'];
    const catMap = new Map<string, { name: string; minutes: number }>();

    categories.forEach((c) => {
      catMap.set(c.id, { name: c.name, minutes: 0 });
    });

    tasks.forEach((t) => {
      const min = Math.round((t.actual_duration || 0) / 60);
      if (min > 0) {
        if (t.category_id && catMap.has(t.category_id)) {
          catMap.get(t.category_id)!.minutes += min;
        } else {
          const uncategorized = catMap.get('uncat') || {
            name: 'Uncategorized',
            minutes: 0,
          };
          uncategorized.minutes += min;
          catMap.set('uncat', uncategorized);
        }
      }
    });

    return Array.from(catMap.values())
      .filter((c) => c.minutes > 0)
      .map((item, idx) => ({
        ...item,
        color: shades[idx % shades.length],
      }));
  }, [tasks, categories]);

  // 3. Status completion breakdown in monochrome
  const statusCounts = React.useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const inbox = tasks.filter((t) => t.status === 'inbox').length;

    return [
      { name: 'Completed', value: completed },
      { name: 'In Progress', value: inProgress },
      { name: 'To Do', value: todo },
      { name: 'Inbox', value: inbox },
    ].filter((item) => item.value > 0);
  }, [tasks]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-72 rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 animate-pulse" />
        <div className="h-72 rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Estimated vs Actual Time (7 Days) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-black dark:text-white">
              Estimated vs. Actual Time (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${val}m`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#000000',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                    formatter={(val: number | string | readonly (number | string)[] | undefined, name: string | number | undefined) => [
                      formatMinutesHuman(Number(val) || 0),
                      name === 'estimated' ? 'Estimated' : 'Actual Tracked',
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    formatter={(value) => (value === 'estimated' ? 'Estimated' : 'Actual Tracked')}
                  />
                  <Bar dataKey="estimated" fill="#71717a" radius={[2, 2, 0, 0]} name="estimated" />
                  <Bar dataKey="actual" fill="#000000" radius={[2, 2, 0, 0]} name="actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Time by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-black dark:text-white">
              Time Spent by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full flex items-center justify-center">
              {categoryData.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  No recorded time entries yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="minutes"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#000000" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#000000',
                        borderColor: '#27272a',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '12px',
                      }}
                      formatter={(val: number | string | readonly (number | string)[] | undefined) => [formatMinutesHuman(Number(val) || 0), 'Time Spent']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Completion Status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-black dark:text-white">
            All-Time Task Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statusCounts.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-black dark:bg-white" />
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    {item.name}
                  </span>
                </div>
                <div className="text-xl font-bold text-black dark:text-white">
                  {item.value} tasks
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
