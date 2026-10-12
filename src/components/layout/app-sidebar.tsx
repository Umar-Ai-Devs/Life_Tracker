'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store/app-store';
import {
  LayoutDashboard,
  Inbox,
  CheckSquare,
  CalendarDays,
  Timer,
  BarChart3,
  Settings,
  Database,
  Layers,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inbox', href: '/inbox', icon: Inbox, countKey: 'inbox' },
  { name: 'My Tasks', href: '/tasks', icon: CheckSquare, countKey: 'active' },
  { name: 'Daily Planner', href: '/planner', icon: CalendarDays },
  { name: 'Time Tracking', href: '/timer', icon: Timer },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { tasks, isSupabaseLive, activeTimer } = useAppStore();

  const inboxCount = tasks.filter((t) => t.status === 'inbox').length;
  const activeCount = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled').length;

  return (
    <aside className="flex h-full w-64 flex-col justify-between border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black">
      <div className="space-y-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-black dark:text-white">
              LifeTracker
            </h1>
            <p className="text-[11px] font-medium text-zinc-500">
              Task & Time System
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white dark:text-black' : 'text-zinc-500'}`} />
                  <span>{item.name}</span>
                </div>

                {item.countKey === 'inbox' && inboxCount > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      isActive
                        ? 'border-white text-white dark:border-black dark:text-black'
                        : 'border-zinc-300 dark:border-zinc-700 text-black dark:text-white'
                    }`}
                  >
                    {inboxCount}
                  </span>
                )}

                {item.countKey === 'active' && activeCount > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      isActive
                        ? 'border-white text-white dark:border-black dark:text-black'
                        : 'border-zinc-300 dark:border-zinc-700 text-black dark:text-white'
                    }`}
                  >
                    {activeCount}
                  </span>
                )}

                {item.href === '/timer' && activeTimer && (
                  <span className="flex h-2 w-2 rounded-full bg-black dark:bg-white animate-ping" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Database / Connection Status */}
      <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-black dark:text-white">
              <Database className="h-3.5 w-3.5" />
              {isSupabaseLive ? 'Supabase Live' : 'Demo Mode'}
            </span>
            <span
              className={`h-2 w-2 rounded-full border border-black dark:border-white ${
                isSupabaseLive ? 'bg-black dark:bg-white' : 'bg-transparent'
              }`}
            />
          </div>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {isSupabaseLive
              ? 'Synced securely to PostgreSQL database.'
              : 'Local storage active. Cloud sync available.'}
          </p>
        </div>
      </div>
    </aside>
  );
}
