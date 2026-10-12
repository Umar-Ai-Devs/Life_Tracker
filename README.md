# 🚀 LifeTracker — Personal Task & Time Management System

A modern, responsive, and resilient **Personal Task Management & Time Tracking System** built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth, RLS)**.

Designed to eliminate cognitive friction in daily task execution by separating rapid capture from daily planning, time-blocking hourly workloads, and persistently tracking focused sessions.

---

## 📋 Table of Contents
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Folder Structure](#-architecture--folder-structure)
- [Database Schema & RLS Security](#-database-schema--rls-security)
- [Quick Start Guide](#-quick-start-guide)
- [Environment Variables](#-environment-variables)
- [Supabase Setup & Migration](#-supabase-setup--migration)
- [Testing Checklist](#-testing-checklist)
- [Deployment](#-deployment)

---

## ✨ Core Features

1. **Dashboard & Productivity Insights**
   - **Today's Overview**: 6 metrics covering Today's tasks, Completed count, Estimated workload, Actual logged time, Remaining planned time, and Overdue deadlines.
   - **Current Hour Focus**: Automatically answers *"What should I work on right now?"* based on scheduled hourly blocks or high-priority items.
   - **Live Active Session Widget**: Digital stopwatch, real-time comparison against estimates, and instant pause/stop/complete controls.

2. **Persistent Time Tracking**
   - **Database Timestamp Persistence**: Time tracking sessions calculate elapsed time from database/storage timestamps (`start_time`), ensuring page refreshes and browser restarts never erase progress.
   - **Single Active Timer Rule**: Enforces at most one active timer per user. Starting a timer on another task automatically finalizes the previous running session.
   - **Overtime Warnings**: Visually highlights tasks that exceed their estimated duration without failing the task.
   - **Manual Adjustments**: Ability to log past sessions with custom dates, duration, and notes.

3. **Daily Planner & Hourly Time-Blocking**
   - **Hourly Timeline (06:00 – 23:00)**: Visual schedule with proportional task blocks, current-time indicator line, and empty slot quick-add shortcuts.
   - **Schedule Conflict Detection**: Automatically identifies overlapping start times and displays an alert with exact overlap minutes.
   - **Unscheduled Backlog Drawer**: Houses tasks planned for the day without fixed hours, plus general inbox tasks ready to be slotted in with 1 click.
   - **Date Navigation**: Previous Day, Next Day, Today, and calendar date picker.

4. **Frictionless Task Inbox**
   - **Rapid 1-Line Capture**: Add tasks with estimated duration in seconds without having to pick a date immediately.
   - **1-Click Triage**: Quickly promote inbox tasks to "Today", "Tomorrow", or assign specific start times.

5. **My Tasks & Filtering**
   - Full text search across task titles and descriptions.
   - Filter by Status (*Inbox, To Do, In Progress, Completed, Cancelled*).
   - Filter by Priority (*Low, Medium, High, Urgent*).
   - Filter by Category (*Work, Engineering, Design, Personal, Health*).
   - Sort by Planned Date, Priority, Estimated Duration, Actual Time, or Created Date.

6. **Productivity Reports & Analytics**
   - **Estimation Calibration**: Compares estimated allowances against real cumulative time to evaluate estimating accuracy.
   - **Weekly Trends**: Bar chart showing 7-day planned estimates vs actual recorded time.
   - **Category Distribution**: Interactive donut chart breaking down time spent across projects and categories.
   - **Task Completion Ratios**: Status breakdown across all tasks.

7. **Theme & Customization**
   - Light & Dark mode support via `next-themes`.
   - Custom category manager with custom color picker.
   - User profile with configurable Timezone and Working Hours.
   - Built-in Demo Mode with pre-seeded data for instant local testing, plus seamless Supabase cloud sync.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16+ (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with custom dark mode design system
- **Backend / Database**: Supabase with PostgreSQL
- **Security**: PostgreSQL Row Level Security (RLS) & Auth Policies
- **Icons**: Lucide Icons
- **Charts**: Recharts
- **State & Resilience**: React Context with unified Supabase API + Local Storage fallback

---

## 📁 Architecture & Folder Structure

```
life-tracker/
├── supabase/
│   └── migrations/
│       └── 20261012_init_schema.sql      # Complete PostgreSQL tables, RLS & triggers
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx            # Supabase Auth Login
│   │   │   └── signup/page.tsx           # Supabase Auth Signup
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                # App shell (Sidebar, Header, Timer Banner)
│   │   │   ├── page.tsx                  # Dashboard & today's schedule
│   │   │   ├── inbox/page.tsx            # Frictionless task capture
│   │   │   ├── tasks/page.tsx            # Filterable & searchable task list
│   │   │   ├── planner/page.tsx          # Hourly timeline & time-blocking
│   │   │   ├── timer/page.tsx            # Stopwatch & session logs
│   │   │   ├── reports/page.tsx          # Productivity analytics & charts
│   │   │   └── settings/page.tsx         # Profiles, timezone, categories
│   │   ├── api/
│   │   │   └── auth/callback/route.ts    # Supabase session callback
│   │   ├── layout.tsx                    # Root layout with Theme & App providers
│   │   └── globals.css                   # Tailwind v4 theme tokens
│   ├── components/
│   │   ├── dashboard/                    # Metrics cards & current focus widget
│   │   ├── layout/                       # Sidebar, Header, GlobalActiveTimerBanner
│   │   ├── planner/                      # HourlyTimeline, UnscheduledDrawer, Conflicts
│   │   ├── reports/                      # ProductivityCharts (Est vs Actual, Categories)
│   │   ├── tasks/                        # TaskCard, TaskFormModal, Badges
│   │   ├── timer/                        # ActiveTimerWidget, ManualTimeEntryModal
│   │   └── ui/                           # Button, Badge, Card, Dialog
│   ├── lib/
│   │   ├── store/
│   │   │   └── app-store.tsx             # Unified state store (Supabase + Local sync)
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Browser Supabase client
│   │   │   └── server.ts                 # Server action Supabase client
│   │   └── utils/
│   │       ├── time.ts                   # Duration formatting & calculation
│   │       ├── conflicts.ts              # Timeline overlap detection
│   │       └── cn.ts                     # Tailwind class merging
│   └── types/
│       └── index.ts                      # Task, Category, TimeEntry, Profile types
├── .env.example                          # Environment variable template
└── .env.local                            # Local development configuration
```

---

## 🗄 Database Schema & RLS Security

The database runs on PostgreSQL with 4 normalized tables located in `supabase/migrations/20261012_init_schema.sql`:

1. `profiles`:
   - `id` (references `auth.users(id) on delete cascade`)
   - `email`, `full_name`, `avatar_url`, `timezone`, `work_start_time`, `work_end_time`, `theme`
2. `categories`:
   - `id`, `user_id`, `name`, `color`, `icon`
3. `tasks`:
   - `id`, `user_id`, `title`, `description`, `estimated_duration` (minutes), `planned_date`, `start_time`, `deadline`, `priority`, `category_id`, `status`, `actual_duration` (seconds), `completed_at`
4. `time_entries`:
   - `id`, `task_id`, `user_id`, `start_time`, `end_time` (null while active), `duration` (seconds), `notes`
   - **Unique partial index**: `unique_active_timer_per_user` on `(user_id) where end_time is null` ensures exactly one active timer per user.

### Row Level Security (RLS)
All tables have RLS enabled with strict policies ensuring:
```sql
using (auth.uid() = user_id)
with check (auth.uid() = user_id)
```
No user can ever view, update, or delete another user's records.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The application runs immediately in **Demo Mode** with realistic sample tasks, time entries, and categories!

---

## 🔐 Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase project keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ⚡ Supabase Setup & Migration

1. Create a new project at [database.new](https://database.new).
2. In the Supabase Dashboard, navigate to the **SQL Editor**.
3. Open `supabase/migrations/20261012_init_schema.sql`, copy its content, and paste it into the SQL Editor.
4. Click **Run**. This creates:
   - All 4 relational tables (`profiles`, `categories`, `tasks`, `time_entries`)
   - Indexes and constraints
   - Row Level Security (RLS) policies
   - Automated triggers for creating new user profiles and default categories upon signup.
5. In your Supabase Dashboard under **Project Settings -> API**, copy your **Project URL** and **anon public key** into your `.env.local` file.
6. Restart `npm run dev` — your app will now sync with Supabase cloud in real time!

---

## 🧪 Testing Checklist

- [x] **Task Creation & Quick Capture**:
  - Add task via top "+ Capture Task" button with title, hours, and minutes.
  - Add task via `/inbox` 1-line rapid input.
  - Verify tasks appear in Inbox or scheduled date.
- [x] **Persistent Time Tracking**:
  - Click "Start" on a task card.
  - Verify global active timer banner appears at the top.
  - Refresh the page and confirm the timer continues counting without losing accumulated seconds.
  - Start timer on a different task and verify the first timer stops cleanly.
  - Click "Pause" or "Stop" and verify actual duration increments.
- [x] **Hourly & Daily Planner**:
  - Visit `/planner`.
  - Check hourly timeline (06:00 to 23:00) with task blocks.
  - Verify the red "NOW" current-time line.
  - Assign start times to unscheduled tasks in the right-hand backlog.
  - Schedule overlapping start times to test the Schedule Conflict Alert.
- [x] **Productivity Analytics**:
  - Visit `/reports`.
  - Verify Estimated vs Actual 7-day bar chart.
  - Verify Time Spent by Category pie chart.
  - Check Estimation Calibration accuracy score.
- [x] **Customization & Themes**:
  - Visit `/settings`.
  - Toggle light and dark mode.
  - Add custom category with custom color.
  - Update user timezone and working hours.

---

## 🌐 Deployment

Deploy effortlessly to Vercel:
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set your environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Click **Deploy**.
#   L i f e _ T r a c k e r  
 