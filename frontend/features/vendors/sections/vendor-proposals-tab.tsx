'use client';

import Link from 'next/link';
import { Mail, BarChart3, Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProposalStatusBadge } from '@/features/rfps';
import { formatDistanceToNow } from 'date-fns';
import type { Vendor } from '@/lib/types';

interface VendorProposalsTabProps {
  vendor: Vendor;
}

export function VendorProposalsTab({ vendor }: VendorProposalsTabProps) {
  const proposals = vendor.proposals || [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Proposal History</CardTitle>
            <CardDescription>All proposals submitted by this vendor</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {proposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <Mail className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="mt-4 font-semibold">No proposals received</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              This vendor hasn&apos;t submitted any proposals yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal: any) => (
              <Link
                key={proposal.id}
                href={`/rfps/${proposal.rfp?.id}`}
                className="block p-4 rounded-xl border-2 border-transparent bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/20 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                      <Mail className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{proposal.rfp?.title || 'Untitled RFP'}</p>
                      <p className="text-sm text-muted-foreground">
                        Received{' '}
                        {formatDistanceToNow(new Date(proposal.receivedAt), { addSuffix: true })}
                      </p>
                      {proposal.aiSummary && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {proposal.aiSummary}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    {proposal.aiScore && (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span className="text-2xl font-bold text-primary">{proposal.aiScore}</span>
                      </div>
                    )}
                    <ProposalStatusBadge status={proposal.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
