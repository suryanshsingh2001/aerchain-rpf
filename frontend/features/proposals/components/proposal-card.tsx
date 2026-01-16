'use client';

import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Proposal } from '@/lib/types';
import { formatCurrency } from '@/features/rfps/utils/format';

interface ProposalCardProps {
  proposal: Proposal;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-medium text-primary">
                {proposal.vendor.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <CardTitle className="text-base">{proposal.vendor.name}</CardTitle>
              <CardDescription>{proposal.vendor.email}</CardDescription>
            </div>
          </div>
          {proposal.aiScore && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{proposal.aiScore}</div>
              <div className="text-xs text-muted-foreground">AI Score</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Price</p>
            <p className="font-medium">
              {formatCurrency(proposal.totalPrice, proposal.currency)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Delivery</p>
            <p className="font-medium">
              {proposal.deliveryDays ? `${proposal.deliveryDays} days` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Warranty</p>
            <p className="font-medium">
              {proposal.warrantyMonths ? `${proposal.warrantyMonths} months` : 'N/A'}
            </p>
          </div>
        </div>

        {proposal.aiSummary && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm">{proposal.aiSummary}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Badge
            variant={
              proposal.status === 'EVALUATED'
                ? 'default'
                : proposal.status === 'PARSED'
                ? 'secondary'
                : 'outline'
            }
          >
            {proposal.status}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Received {formatDistanceToNow(new Date(proposal.receivedAt), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
