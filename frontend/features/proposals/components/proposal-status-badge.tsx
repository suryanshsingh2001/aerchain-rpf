'use client';

import { Badge } from '@/components/ui/badge';

interface ProposalStatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, string> = {
  EVALUATED:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
  PARSED:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
  RECEIVED:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
};

export function ProposalStatusBadge({ status }: ProposalStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`font-medium ${statusConfig[status] || statusConfig.RECEIVED}`}
    >
      {status}
    </Badge>
  );
}
