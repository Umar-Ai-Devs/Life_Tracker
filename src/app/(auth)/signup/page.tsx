'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Layers, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isSupabaseConfigured()) {
      router.push('/');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Signup failed.');
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
            Create Your Account
          </CardTitle>
          <p className="text-xs text-zinc-500">
            Start organizing your daily schedule and tracking your real productivity.
          </p>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-black dark:border-white p-3 text-xs text-black dark:text-white">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="rounded-xl border border-black dark:border-white p-4 text-center space-y-2">
              <CheckCircle2 className="mx-auto h-8 w-8 text-black dark:text-white" />
              <h4 className="text-sm font-bold text-black dark:text-white">
                Check your email
              </h4>
              <p className="text-xs text-zinc-500">
                We sent a confirmation link to <span className="font-semibold text-black dark:text-white">{email}</span>. Please click the link to activate your account.
              </p>
              <Link href="/login">
                <Button size="sm" variant="outline" className="mt-2 text-xs">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-black dark:text-white mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Vance"
                  className="w-full rounded-xl border border-zinc-300 bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-black placeholder-zinc-400 focus:border-black focus:outline-none dark:border-zinc-700 dark:text-white dark:focus:border-white"
                />
              </div>

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
                <label className="block text-xs font-semibold text-black dark:text-white mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-zinc-300 bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-black placeholder-zinc-400 focus:border-black focus:outline-none dark:border-zinc-700 dark:text-white dark:focus:border-white"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full text-xs font-semibold">
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center border-t border-zinc-100 dark:border-zinc-900 py-4">
          <p className="text-xs text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-black hover:underline dark:text-white">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
