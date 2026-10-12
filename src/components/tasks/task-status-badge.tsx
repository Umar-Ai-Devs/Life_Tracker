'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TaskStatus } from '@/types';
import { Inbox, CheckCircle2, Clock, PlayCircle, XCircle } from 'lucide-react';

interface Props {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: Props) {
  switch (status) {
    case 'inbox':
      return (
        <Badge variant="secondary">
          <Inbox className="h-3 w-3" />
          Inbox
        </Badge>
      );
    case 'todo':
      return (
        <Badge variant="outline">
          <Clock className="h-3 w-3" />
          To Do
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="default">
          <PlayCircle className="h-3 w-3" />
          In Progress
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="secondary">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="secondary" className="opacity-50">
          <XCircle className="h-3 w-3" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
