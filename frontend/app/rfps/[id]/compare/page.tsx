'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Loader2,
  BarChart3,
  Trophy,
  CheckCircle2,
  XCircle,
  DollarSign,
  Clock,
  Shield,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRfp } from '@/hooks/use-rfps';
import { useProposals } from '@/hooks/use-proposals';
import type { Proposal, ComparisonResult } from '@/lib/types';
import { toast } from 'sonner';

function ScoreIndicator({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className={`inline-flex items-center justify-center h-12 w-12 rounded-full font-bold ${getColor()}`}>
      {score}
    </div>
  );
}

function ComparisonMetric({
  label,
  values,
  bestIndex,
  icon: Icon,
  format = (v: any) => v?.toString() || 'N/A',
}: {
  label: string;
  values: any[];
  bestIndex: number;
  icon: React.ComponentType<{ className?: string }>;
  format?: (v: any) => string;
}) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${values.length}, 1fr)` }}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {values.map((value, idx) => (
        <div
          key={idx}
          className={`text-center p-2 rounded ${
            idx === bestIndex ? 'bg-green-50 border border-green-200' : ''
          }`}
        >
          <span className={`font-medium ${idx === bestIndex ? 'text-green-700' : ''}`}>
            {format(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ComparisonPage() {
  const params = useParams();
  const rfpId = params.id as string;

  const { rfp, loading: rfpLoading, fetchRfp } = useRfp(rfpId);
  const { proposals, loading: proposalsLoading, fetchProposals, comparison, comparing, compareProposals } = useProposals(rfpId);
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

  const formatCurrency = (value: string | null | undefined, currency = 'USD') => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  const loading = rfpLoading || proposalsLoading;

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Compare Proposals" />
        <div className="flex-1 p-6 space-y-6">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="flex flex-col h-full">
        <Header title="RFP Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto" />
            <h2 className="mt-4 text-lg font-semibold">RFP not found</h2>
            <Button className="mt-4" asChild>
              <Link href="/rfps">Back to RFPs</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Sort proposals by AI score
  const sortedProposals = [...proposals].sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
  const recommendedVendor = localComparison?.recommendation;

  // Find best values for comparison
  const prices = proposals.map((p) => p.totalPrice ? parseFloat(p.totalPrice) : null);
  const deliveryDays = proposals.map((p) => p.deliveryDays ?? null);
  const warrantyMonths = proposals.map((p) => p.warrantyMonths ?? null);

  const lowestPriceIdx = prices.reduce<number>((best, price, idx) => {
    if (price === null) return best;
    if (best === -1) return idx;
    const bestPrice = prices[best];
    return bestPrice !== null && price < bestPrice ? idx : best;
  }, -1);

  const fastestDeliveryIdx = deliveryDays.reduce<number>((best, days, idx) => {
    if (days === null) return best;
    if (best === -1) return idx;
    const bestDays = deliveryDays[best];
    return bestDays !== null && days < bestDays ? idx : best;
  }, -1);

  const longestWarrantyIdx = warrantyMonths.reduce<number>((best, months, idx) => {
    if (months === null) return best;
    if (best === -1) return idx;
    const bestMonths = warrantyMonths[best];
    return bestMonths !== null && months > bestMonths ? idx : best;
  }, -1);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Compare Proposals"
        description={rfp.title}
        breadcrumbs={[
          { label: 'RFPs', href: '/rfps' },
          { label: rfp.title, href: `/rfps/${rfpId}` },
          { label: 'Compare' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Compare Action */}
        <div className="flex items-center justify-end">
          <Button onClick={handleCompare} disabled={comparing || proposals.length === 0}>
            {comparing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Run AI Comparison
              </>
            )}
          </Button>
        </div>

        {proposals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No proposals to compare</h3>
              <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                Add proposals to this RFP to see a side-by-side comparison.
              </p>
              <Button className="mt-4" variant="outline" asChild>
                <Link href={`/rfps/${rfpId}/add-proposal`}>
                  Add Proposal
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* AI Recommendation */}
            {recommendedVendor && (
              <Card className="border-green-500/50 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-xl text-green-700">
                          {recommendedVendor.vendorName}
                        </h3>
                        <Badge className="bg-green-600">Recommended</Badge>
                      </div>
                      <p className="text-muted-foreground">{recommendedVendor.reasoning}</p>
                    </div>
                  </div>
                  {localComparison.summary && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-sm text-muted-foreground">{localComparison.summary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Score Overview */}
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
                      idx === 0 && proposal.aiScore ? 'border-green-500/50 bg-green-50/50' : ''
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{proposal.vendor.name}</p>
                        {recommendedVendor?.vendorId === proposal.vendorId && (
                          <Badge className="bg-green-600">Recommended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {proposal.aiSummary || 'No summary available'}
                      </p>
                    </div>
                    <div className="text-right">
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

            {/* Detailed Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Side-by-Side Comparison</CardTitle>
                <CardDescription>
                  Compare key metrics across all proposals
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Metric</TableHead>
                      {proposals.map((proposal) => (
                        <TableHead key={proposal.id} className="text-center min-w-[150px]">
                          <div className="flex flex-col items-center gap-1">
                            <span>{proposal.vendor.name}</span>
                            {proposal.aiScore && (
                              <Badge variant="outline" className="text-xs">
                                Score: {proposal.aiScore}
                              </Badge>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Total Price */}
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          Total Price
                        </div>
                      </TableCell>
                      {proposals.map((proposal, idx) => (
                        <TableCell
                          key={proposal.id}
                          className={`text-center ${
                            idx === lowestPriceIdx ? 'bg-green-50 text-green-700 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {formatCurrency(proposal.totalPrice, proposal.currency)}
                            {idx === lowestPriceIdx && <TrendingDown className="h-4 w-4" />}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Delivery Days */}
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          Delivery Time
                        </div>
                      </TableCell>
                      {proposals.map((proposal, idx) => (
                        <TableCell
                          key={proposal.id}
                          className={`text-center ${
                            idx === fastestDeliveryIdx ? 'bg-green-50 text-green-700 font-medium' : ''
                          }`}
                        >
                          {proposal.deliveryDays ? `${proposal.deliveryDays} days` : 'N/A'}
                          {idx === fastestDeliveryIdx && proposal.deliveryDays && (
                            <span className="ml-1 text-green-600">✓</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Warranty */}
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          Warranty
                        </div>
                      </TableCell>
                      {proposals.map((proposal, idx) => (
                        <TableCell
                          key={proposal.id}
                          className={`text-center ${
                            idx === longestWarrantyIdx ? 'bg-green-50 text-green-700 font-medium' : ''
                          }`}
                        >
                          {proposal.warrantyMonths ? `${proposal.warrantyMonths} months` : 'N/A'}
                          {idx === longestWarrantyIdx && proposal.warrantyMonths && (
                            <span className="ml-1 text-green-600">✓</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Payment Terms */}
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Payment Terms
                        </div>
                      </TableCell>
                      {proposals.map((proposal) => (
                        <TableCell key={proposal.id} className="text-center">
                          {proposal.paymentTerms || 'N/A'}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Status */}
                    <TableRow>
                      <TableCell className="font-medium">Status</TableCell>
                      {proposals.map((proposal) => (
                        <TableCell key={proposal.id} className="text-center">
                          <Badge variant="outline">{proposal.status}</Badge>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Strengths and Weaknesses */}
            {proposals.some((p) => p.aiStrengths || p.aiWeaknesses) && (
              <div className="grid gap-6 md:grid-cols-2">
                {proposals.map((proposal) => (
                  <Card key={proposal.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{proposal.vendor.name}</CardTitle>
                        {proposal.aiScore && <ScoreIndicator score={proposal.aiScore} />}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {proposal.aiStrengths && proposal.aiStrengths.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Strengths
                          </h4>
                          <ul className="space-y-1">
                            {proposal.aiStrengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">•</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {proposal.aiWeaknesses && proposal.aiWeaknesses.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                            <XCircle className="h-4 w-4" />
                            Weaknesses
                          </h4>
                          <ul className="space-y-1">
                            {proposal.aiWeaknesses.map((weakness, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-red-600 mt-0.5">•</span>
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
