'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white',
        secondary:
          'bg-zinc-100 text-zinc-900 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800',
        destructive:
          'bg-black text-white border border-black dark:bg-white dark:text-black dark:border-white',
        warning:
          'bg-zinc-200 text-black border border-zinc-400 dark:bg-zinc-800 dark:text-white dark:border-zinc-700',
        success:
          'bg-black text-white dark:bg-white dark:text-black',
        purple:
          'bg-zinc-100 text-black border border-zinc-300 dark:bg-zinc-900 dark:text-white dark:border-zinc-800',
        outline:
          'border border-black text-black dark:border-white dark:text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
