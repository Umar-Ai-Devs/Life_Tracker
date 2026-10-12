'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Layers, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isSupabaseConfigured()) {
      router.push('/');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-white dark:bg-black">
      <Card className="w-full max-w-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-lg">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
            <Layers className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-black tracking-tight text-black dark:text-white">
            Welcome to LifeTracker
          </CardTitle>
          <p className="text-xs text-zinc-500">
            Sign in to access your tasks, daily planner, and persistent time logs.
          </p>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-black dark:border-white p-3 text-xs text-black dark:text-white">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-black dark:text-white mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-black placeholder-zinc-400 focus:border-black focus:outline-none dark:border-zinc-700 dark:text-white dark:focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black dark:text-white mb-1.5 flex justify-between">
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-black placeholder-zinc-400 focus:border-black focus:outline-none dark:border-zinc-700 dark:text-white dark:focus:border-white"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full text-xs font-semibold">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {!isSupabaseConfigured() && (
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 text-center">
              <p className="text-[11px] text-zinc-500 mb-2">
                Running in local offline mode (no Supabase keys required to test).
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/')}
                className="w-full text-xs gap-1.5"
              >
                <span>Enter Demo Mode Immediately</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-center border-t border-zinc-100 dark:border-zinc-900 py-4">
          <p className="text-xs text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-black hover:underline dark:text-white">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
