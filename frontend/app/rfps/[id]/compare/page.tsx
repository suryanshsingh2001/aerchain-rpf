'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Sparkles, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRfp } from '@/hooks/use-rfps';
import { useProposals } from '@/hooks/use-proposals';
import {
  ProposalRankingList,
  ComparisonTable,
  StrengthsWeaknessesGrid,
} from '@/features/rfps';
import { NotFoundState, EmptyState } from '@/features/shared';
import type { ComparisonResult } from '@/lib/types';
import { toast } from 'sonner';

export default function ComparisonPage() {
  const params = useParams();
  const rfpId = params.id as string;

  const { rfp, loading: rfpLoading, fetchRfp } = useRfp(rfpId);
  const {
    proposals,
    loading: proposalsLoading,
    fetchProposals,
    comparison,
    comparing,
    compareProposals,
  } = useProposals(rfpId);
  const [localComparison, setLocalComparison] = useState<ComparisonResult | null>(null);

  useEffect(() => {
    fetchRfp();
    fetchProposals();
  }, [fetchRfp, fetchProposals]);

  useEffect(() => {
    if (comparison) {
      setLocalComparison(comparison);
    }
  }, [comparison]);

  const handleCompare = async () => {
    const result = await compareProposals();
    if (result) {
      setLocalComparison(result);
      toast.success('AI comparison completed!');
      fetchProposals();
    } else {
      toast.error('Failed to compare proposals');
    }
  };

  const loading = rfpLoading || proposalsLoading;

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!rfp) {
    return <NotFoundState entity="RFP" backHref="/rfps" backLabel="Back to RFPs" />;
  }

  const recommendedVendor = localComparison?.recommendation;

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto max-w-6xl mx-auto w-full">
      {/* Compare Action */}
      <div className="flex items-center justify-end">
        <Button onClick={handleCompare} disabled={comparing || proposals.length === 0}>
          {comparing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Compare with AI
            </>
          )}
        </Button>
      </div>

      {proposals.length === 0 ? (
        <EmptyState
          type="proposals"
          title="No proposals to compare"
          description="Add proposals to this RFP to see a side-by-side comparison."
          action={{
            label: 'Add Proposal',
            href: `/rfps/${rfpId}/add-proposal`,
          }}
        />
      ) : (
        <>
          {/* AI Recommendation */}
          {recommendedVendor && (
            <Card className="border-green-500/50 bg-linear-to-r from-green-500/5 to-emerald-500/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-green-500 to-emerald-600 shrink-0">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-xl text-green-700 dark:text-green-400">
                        {recommendedVendor.vendorName}
                      </h3>
                      <Badge className="bg-green-600">Recommended</Badge>
                    </div>
                    <p className="text-muted-foreground">{recommendedVendor.reasoning}</p>
                  </div>
                </div>
                {localComparison?.summary && (
                  <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                    <p className="text-sm text-muted-foreground">{localComparison.summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Score Rankings */}
          <ProposalRankingList
            proposals={proposals}
            recommendedVendorId={recommendedVendor?.vendorId}
          />

          {/* Detailed Comparison Table */}
          <ComparisonTable proposals={proposals} />

          {/* Strengths and Weaknesses */}
          <StrengthsWeaknessesGrid proposals={proposals} />
        </>
      )}
    </div>
  );
}