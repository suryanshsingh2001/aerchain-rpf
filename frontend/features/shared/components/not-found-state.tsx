'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotFoundStateProps {
  /** Entity name (e.g., "RFP", "Vendor") */
  entity?: string;
  /** Back button destination */
  backHref?: string;
  /** Back button label */
  backLabel?: string;
}

export function NotFoundState({
  entity = 'Item',
  backHref = '/',
  backLabel = 'Go Back',
}: NotFoundStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold">{entity} not found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The {entity.toLowerCase()} you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button className="mt-4" asChild>
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
