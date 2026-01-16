'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VendorStatusBadgeProps {
  status: 'ACTIVE' | 'INACTIVE';
  size?: 'sm' | 'md';
}

const statusConfig = {
  ACTIVE: {
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    icon: CheckCircle2,
    label: 'Active',
  },
  INACTIVE: {
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    icon: XCircle,
    label: 'Inactive',
  },
};

export function VendorStatusBadge({ status, size = 'sm' }: VendorStatusBadgeProps) {
  const { className, icon: Icon, label } = statusConfig[status];
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const padding = size === 'md' ? 'px-3 py-1' : '';

  return (
    <Badge variant="outline" className={`gap-1.5 font-medium ${className} ${padding}`}>
      <Icon className={iconSize} />
      {label}
    </Badge>
  );
}
