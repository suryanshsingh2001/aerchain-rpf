'use client';

import Link from 'next/link';
import { Users, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Rfp } from '@/lib/types';

interface RfpVendorsTabProps {
  rfp: Rfp;
}

export function RfpVendorsTab({ rfp }: RfpVendorsTabProps) {
  const vendors = rfp.rfpVendors || [];

  const getEmailStatusStyles = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Selected Vendors</CardTitle>
            <CardDescription>Vendors this RFP was sent to</CardDescription>
          </div>
        </div>
        {rfp.status === 'DRAFT' && (
          <Button size="sm" asChild>
            <Link href={`/rfps/${rfp.id}/send`}>
              <Plus className="h-4 w-4" />
              Add Vendors
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {vendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <Users className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="mt-4 text-sm font-medium">No vendors selected yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Select vendors to send this RFP
            </p>
            <Button className="mt-4" size="sm" asChild>
              <Link href={`/rfps/${rfp.id}/send`}>Select Vendors</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {vendors.map((rv) => (
              <div
                key={rv.id}
                className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-primary/10">
                    <span className="text-sm font-semibold text-primary">
                      {rv.vendor.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{rv.vendor.name}</p>
                    <p className="text-sm text-muted-foreground">{rv.vendor.email}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`font-medium ${getEmailStatusStyles(rv.emailStatus)}`}
                >
                  {rv.emailStatus === 'SENT' && <CheckCircle2 className="mr-1.5 h-3 w-3" />}
                  {rv.emailStatus}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
