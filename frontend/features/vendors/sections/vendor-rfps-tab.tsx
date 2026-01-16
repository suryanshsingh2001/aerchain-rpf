'use client';

import Link from 'next/link';
import { FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmailStatusBadge } from '@/features/rfps';
import { formatDistanceToNow } from 'date-fns';
import type { Vendor } from '@/lib/types';

interface VendorRfpsTabProps {
  vendor: Vendor;
}

export function VendorRfpsTab({ vendor }: VendorRfpsTabProps) {
  const rfpVendors = vendor.rfpVendors || [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">RFP History</CardTitle>
            <CardDescription>All RFPs sent to this vendor</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {rfpVendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <FileText className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="mt-4 font-semibold">No RFPs sent yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              This vendor hasn&apos;t received any RFPs. Send them an RFP to get started.
            </p>
            <Button className="mt-4" size="sm" asChild>
              <Link href="/rfps">
                <Send className="mr-2 h-4 w-4" />
                Browse RFPs
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {rfpVendors.map((rv: any) => (
              <Link
                key={rv.id}
                href={`/rfps/${rv.rfp?.id}`}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{rv.rfp?.title || 'Untitled RFP'}</p>
                    <p className="text-sm text-muted-foreground">
                      {rv.sentAt
                        ? `Sent ${formatDistanceToNow(new Date(rv.sentAt), { addSuffix: true })}`
                        : 'Pending delivery'}
                    </p>
                  </div>
                </div>
                <EmailStatusBadge status={rv.emailStatus} />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
