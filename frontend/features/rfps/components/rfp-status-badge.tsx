'use client';

import { FileText, Mail, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RfpStatus } from '@/lib/types';

const statusConfig: Record<
  RfpStatus,
  {
    className: string;
    icon: typeof FileText;
  }
> = {
  DRAFT: {
    className:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    icon: FileText,
  },
  SENT: {
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    icon: Mail,
  },
  EVALUATING: {
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    icon: Clock,
  },
  CLOSED: {
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    icon: CheckCircle2,
  },
};

interface RfpStatusBadgeProps {
  status: RfpStatus;
  size?: 'sm' | 'md';
}

export function RfpStatusBadge({ status, size = 'sm' }: RfpStatusBadgeProps) {
  const { className, icon: Icon } = statusConfig[status];
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const padding = size === 'md' ? 'px-3 py-1' : '';

  return (
    <Badge variant="outline" className={`gap-1.5 font-medium ${className} ${padding}`}>
      <Icon className={iconSize} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}
