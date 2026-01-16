'use client';

import Link from 'next/link';
import { Printer, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RfpStatusBadge } from '@/features/rfps';
import { format, formatDistanceToNow } from 'date-fns';
import type { Rfp } from '@/lib/types';

interface RfpDetailHeaderProps {
  rfp: Rfp;
  onPrint: () => void;
  onDelete: () => void;
}

export function RfpDetailHeader({ rfp, onPrint, onDelete }: RfpDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:hidden">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{rfp.title}</h1>
          <RfpStatusBadge status={rfp.status} />
        </div>
        <p className="text-muted-foreground">
          Created {format(new Date(rfp.createdAt), 'PPP')} •{' '}
          {formatDistanceToNow(new Date(rfp.createdAt), { addSuffix: true })}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onPrint}>
          <Printer className="h-4 w-4" />
          Print / PDF
        </Button>
        {rfp.status === 'DRAFT' && (
          <Button size="sm" asChild>
            <Link href={`/rfps/${rfp.id}/send`}>
              <Send className="h-4 w-4" />
              Send to Vendors
            </Link>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
