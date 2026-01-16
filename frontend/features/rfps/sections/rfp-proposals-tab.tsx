'use client';

import Link from 'next/link';
import { Mail, Plus, BarChart3, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ProposalCard } from '../components/proposal-card';
import type { Rfp, Proposal } from '@/lib/types';

interface ComparisonResult {
  summary: string;
  recommendation: {
    vendorId: string;
    vendorName: string;
    reasoning: string;
  };
}

interface RfpProposalsTabProps {
  rfp: Rfp;
  proposals: Proposal[];
  loading: boolean;
  comparing: boolean;
  comparison: ComparisonResult | null;
  onCompare: () => void;
}

export function RfpProposalsTab({
  rfp,
  proposals,
  loading,
  comparing,
  comparison,
  onCompare,
}: RfpProposalsTabProps) {
  return (
    <div className="space-y-6">
      {/* Compare Button */}
      {proposals.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl bg-muted/30 border">
          <div>
            <p className="font-medium">
              {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} received
            </p>
            <p className="text-sm text-muted-foreground">Compare and analyze with AI</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onCompare} disabled={comparing}>
              {comparing ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Compare Proposals
                </>
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/rfps/${rfp.id}/compare`}>View Full Comparison</Link>
            </Button>
          </div>
        </div>
      )}

      {/* AI Recommendation */}
      {comparison && (
        <Card className="border-emerald-500/50 bg-linear-to-br from-emerald-500/5 to-transparent overflow-hidden">
          <CardHeader className="border-b border-emerald-500/20">
            <CardTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
              </div>
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-xl">{comparison.recommendation.vendorName}</p>
                <p className="text-muted-foreground text-sm">Recommended Vendor</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">{comparison.recommendation.reasoning}</p>
            <Separator />
            <p className="text-sm text-muted-foreground">{comparison.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Proposals Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4">
              <Mail className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No proposals yet</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              Proposals will appear here when vendors respond to this RFP via email.
            </p>
            <Button className="mt-6" variant="outline" asChild>
              <Link href={`/rfps/${rfp.id}/add-proposal`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Proposal Manually
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}
    </div>
  );
}
