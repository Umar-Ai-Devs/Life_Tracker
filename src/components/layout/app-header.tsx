'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { Button } from '@/components/ui/button';
import { TaskFormModal } from '@/components/tasks/task-form-modal';
import { useTheme } from 'next-themes';
import {
  Calendar,
  Plus,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';

export function AppHeader({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const { profile } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [todayFormatted, setTodayFormatted] = useState('');

  useEffect(() => {
    setTodayFormatted(
      new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    );
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-black/95">
        {/* Left: Mobile menu toggle & Date */}
        <div className="flex items-center gap-3">
          <Button
            size="iconSm"
            variant="ghost"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="md:hidden text-zinc-600 dark:text-zinc-400"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 text-xs font-semibold text-black dark:text-white">
            <Calendar className="h-4 w-4" />
            <span>{todayFormatted || 'Today'}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setShowQuickAdd(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Capture Task</span>
            <span className="sm:hidden">Add</span>
          </Button>

          {/* Theme Toggle */}
          <Button
            size="iconSm"
            variant="outline"
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* User profile capsule */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold">
              {profile.full_name ? profile.full_name[0] : 'U'}
            </div>
            <span className="hidden md:inline text-xs font-medium text-black dark:text-white max-w-[100px] truncate">
              {profile.full_name || 'User'}
            </span>
          </div>
        </div>
      </header>

      {/* Quick Add Modal */}
      <TaskFormModal
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
      />
    </>
  );
}
