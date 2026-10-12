'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Priority } from '@/types';
import { AlertCircle, Flame, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  priority: Priority;
}

export function PriorityBadge({ priority }: Props) {
  switch (priority) {
    case 'urgent':
      return (
        <Badge variant="default">
          <Flame className="h-3 w-3" />
          Urgent
        </Badge>
      );
    case 'high':
      return (
        <Badge variant="outline">
          <AlertCircle className="h-3 w-3" />
          High
        </Badge>
      );
    case 'medium':
      return (
        <Badge variant="secondary">
          <ArrowUp className="h-3 w-3" />
          Medium
        </Badge>
      );
    case 'low':
      return (
        <Badge variant="secondary" className="opacity-70">
          <ArrowDown className="h-3 w-3" />
          Low
        </Badge>
      );
    default:
      return null;
  }
}
