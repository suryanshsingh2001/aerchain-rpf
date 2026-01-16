'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScoreIndicator } from './comparison-components';
import type { Proposal } from '@/lib/types';

interface ProposalRankingListProps {
  proposals: Proposal[];
  recommendedVendorId?: string;
}

export function ProposalRankingList({ proposals, recommendedVendorId }: ProposalRankingListProps) {
  // Sort proposals by AI score
  const sortedProposals = [...proposals].sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Score Rankings</CardTitle>
        <CardDescription>
          Proposals ranked by AI-generated scores based on RFP requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedProposals.map((proposal, idx) => (
          <div
            key={proposal.id}
            className={`flex items-center gap-4 p-4 rounded-lg border ${
              idx === 0 && proposal.aiScore ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''
            }`}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-semibold">
              #{idx + 1}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <span className="text-lg font-medium text-primary">
                {proposal.vendor.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{proposal.vendor.name}</p>
                {recommendedVendorId === proposal.vendorId && (
                  <Badge className="bg-green-600 shrink-0">Recommended</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {proposal.aiSummary || 'No summary available'}
              </p>
            </div>
            <div className="text-right shrink-0">
              {proposal.aiScore ? (
                <>
                  <ScoreIndicator score={proposal.aiScore} />
                  <p className="text-xs text-muted-foreground mt-1">AI Score</p>
                </>
              ) : (
                <Badge variant="outline">Not scored</Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
