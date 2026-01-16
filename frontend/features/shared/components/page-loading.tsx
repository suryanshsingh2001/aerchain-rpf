'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface PageLoadingProps {
  /** Preset layout type */
  variant?: 'detail' | 'form' | 'table' | 'cards';
  /** Optional custom className */
  className?: string;
}

export function PageLoading({ variant = 'detail', className }: PageLoadingProps) {
  if (variant === 'form') {
    return (
      <div className={`flex-1 p-6 space-y-6 max-w-2xl mx-auto w-full ${className || ''}`}>
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="flex justify-end gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`flex-1 p-6 space-y-6 ${className || ''}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className={`flex-1 p-6 space-y-6 ${className || ''}`}>
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Default: detail variant
  return (
    <div className={`flex-1 p-6 space-y-6 ${className || ''}`}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
