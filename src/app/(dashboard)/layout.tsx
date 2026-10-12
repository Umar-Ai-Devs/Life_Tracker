'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { GlobalActiveTimerBanner } from '@/components/layout/global-active-timer-banner';
import { X } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-black">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl dark:bg-black border-r border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <AppSidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Pinned Global Active Timer Banner */}
        <GlobalActiveTimerBanner />

        {/* Header */}
        <AppHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
