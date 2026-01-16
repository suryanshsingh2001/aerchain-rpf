'use client';

import Link from 'next/link';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Vendor } from '@/lib/types';

interface SendActionBarProps {
  rfpId: string;
  selectedVendors: Set<string>;
  vendors: Vendor[];
  sending: boolean;
  onSend: () => void;
}

export function SendActionBar({
  rfpId,
  selectedVendors,
  vendors,
  sending,
  onSend,
}: SendActionBarProps) {
  const selectedCount = selectedVendors.size;

  return (
    <div className="sticky bottom-4 mt-4 bg-background/80 backdrop-blur-sm rounded-xl border p-4 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {selectedCount > 0 ? (
            <>
              {/* Avatar Stack */}
              <div className="flex -space-x-2">
                {Array.from(selectedVendors)
                  .slice(0, 3)
                  .map((vendorId) => {
                    const vendor = vendors.find((v) => v.id === vendorId);
                    return (
                      <div
                        key={vendorId}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium border-2 border-background"
                      >
                        {vendor?.name.charAt(0).toUpperCase() || '?'}
                      </div>
                    );
                  })}
                {selectedCount > 3 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium border-2 border-background">
                    +{selectedCount - 3}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {selectedCount} vendor{selectedCount !== 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-muted-foreground">Ready to send</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select vendors to continue</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link href={`/rfps/${rfpId}`}>Cancel</Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={sending || selectedCount === 0} size="lg" className="gap-2 px-6">
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send RFP
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will send the RFP to {selectedCount} selected vendor
                  {selectedCount !== 1 ? 's' : ''}. Each vendor will receive an email notification
                  inviting them to submit a proposal.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onSend}>Confirm Send</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
