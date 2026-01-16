'use client';

import Link from 'next/link';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VendorStatusBadge } from '../components/vendor-status-badge';
import { format } from 'date-fns';
import type { Vendor } from '@/lib/types';

interface VendorDetailHeaderProps {
  vendor: Vendor;
  onDelete: () => void;
}

export function VendorDetailHeader({ vendor, onDelete }: VendorDetailHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="mt-1">
            <Link href="/vendors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 border">
            <span className="text-2xl font-bold text-primary">
              {vendor.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{vendor.name}</h1>
            <p className="text-muted-foreground">
              Added {format(new Date(vendor.createdAt), 'PPP')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <VendorStatusBadge status={vendor.status} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end print:hidden">
        <Button variant="outline" asChild>
          <Link href={`/vendors/${vendor.id}/edit`}>
            <Edit className="h-4 w-4" />
            Edit Vendor
          </Link>
        </Button>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </>
  );
}
