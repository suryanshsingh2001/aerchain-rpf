'use client';

import { CheckCircle2, Clock, XCircle, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EmailStatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { className: string; icon: typeof Mail }> = {
  SENT: {
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  PENDING: {
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
    icon: Clock,
  },
  FAILED: {
    className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300',
    icon: XCircle,
  },
};

export function EmailStatusBadge({ status }: EmailStatusBadgeProps) {
  const { className, icon: Icon } = statusConfig[status] || statusConfig.PENDING;

  return (
    <Badge variant="outline" className={`gap-1 font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}
