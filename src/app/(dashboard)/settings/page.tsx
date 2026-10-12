'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  User,
  Globe,
  Clock,
  Palette,
  Tag,
  Database,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    profile,
    updateProfile,
    categories,
    createCategory,
    deleteCategory,
    resetToSampleData,
    isSupabaseLive,
  } = useAppStore();

  const { theme, setTheme } = useTheme();

  const [fullName, setFullName] = useState(profile.full_name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [timezone, setTimezone] = useState(profile.timezone || 'UTC');
  const [workStart, setWorkStart] = useState(profile.work_start_time || '09:00');
  const [workEnd, setWorkEnd] = useState(profile.work_end_time || '18:00');
  const [isSaved, setIsSaved] = useState(false);

  // New category form
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      full_name: fullName,
      email,
      timezone,
      work_start_time: workStart,
      work_end_time: workEnd,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await createCategory(newCatName.trim(), newCatColor);
    setNewCatName('');
  };

  const handleAutoDetectTimezone = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) setTimezone(tz);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white flex items-center gap-2">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Configure time zone, working hours, categories, theme, and Supabase integration.
        </p>
      </div>

      {isSaved && (
        <div className="flex items-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-3 text-xs text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
          <CheckCircle2 className="h-4 w-4" />
          <span>Profile preferences saved successfully!</span>
        </div>
      )}

      {/* Profile & Working Schedule Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-black dark:text-white">
            <User className="h-4 w-4 text-black dark:text-white" />
            <span>Profile & Working Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-black dark:text-white mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black dark:text-white mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-black dark:text-white mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Time Zone
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoDetectTimezone}
                    className="text-[10px] text-black dark:text-white underline cursor-pointer"
                  >
                    Auto-detect
                  </button>
                </label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="e.g., America/New_York or UTC"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black dark:text-white mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Work Day Starts
                </label>
                <input
                  type="time"
                  value={workStart}
                  onChange={(e) => setWorkStart(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black dark:text-white mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Work Day Ends
                </label>
                <input
                  type="time"
                  value={workEnd}
                  onChange={(e) => setWorkEnd(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" className="text-xs font-semibold">
                Save Preferences
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Category Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-black dark:text-white">
            <Tag className="h-4 w-4 text-black dark:text-white" />
            <span>Task Categories & Tags</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing categories list */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-900 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0 border border-black dark:border-white bg-black dark:bg-white"
                  />
                  <span className="font-semibold text-black dark:text-white truncate">
                    {cat.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => deleteCategory(cat.id)}
                  title="Delete category"
                  aria-label={`Delete category ${cat.name}`}
                  className="rounded p-1 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new category inline */}
          <form
            onSubmit={handleAddCategory}
            className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800"
          >
            <input
              type="text"
              placeholder="New category name (e.g. Marketing)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full sm:flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs text-black dark:border-zinc-800 dark:bg-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button type="submit" size="sm" variant="outline" className="text-xs gap-1 shrink-0">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Category</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-black dark:text-white">
            <Palette className="h-4 w-4 text-black dark:text-white" />
            <span>Theme & Visual Styling</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`rounded-xl border p-3 text-center text-xs font-bold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                  : 'border-zinc-200 hover:bg-zinc-100 text-black dark:border-zinc-800 dark:hover:bg-zinc-900 dark:text-white'
              }`}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`rounded-xl border p-3 text-center text-xs font-bold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                  : 'border-zinc-200 hover:bg-zinc-100 text-black dark:border-zinc-800 dark:hover:bg-zinc-900 dark:text-white'
              }`}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`rounded-xl border p-3 text-center text-xs font-bold transition-all cursor-pointer ${
                theme === 'system'
                  ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                  : 'border-zinc-200 hover:bg-zinc-100 text-black dark:border-zinc-800 dark:hover:bg-zinc-900 dark:text-white'
              }`}
            >
              System
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Supabase Connection Status & Database Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-black dark:text-white">
            <Database className="h-4 w-4 text-black dark:text-white" />
            <span>Database & Storage Architecture</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full border border-black dark:border-white ${
                    isSupabaseLive ? 'bg-black dark:bg-white' : 'bg-transparent'
                  }`}
                />
                <span className="text-xs font-bold text-black dark:text-white">
                  {isSupabaseLive ? 'Connected to Supabase PostgreSQL' : 'Local Storage (Demo Mode)'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">
                {isSupabaseLive
                  ? 'All tasks, categories, and time entries are authenticated and isolated via PostgreSQL Row Level Security (RLS).'
                  : 'Currently running in resilient client storage. To connect to Supabase, populate NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file and execute the SQL migration in supabase/migrations/20261012_init_schema.sql.'}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={resetToSampleData}
              className="gap-1 text-xs shrink-0 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear All Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
