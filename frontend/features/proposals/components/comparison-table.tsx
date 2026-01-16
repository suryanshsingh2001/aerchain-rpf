'use client';

import { DollarSign, Clock, Shield, FileText, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/features/rfps/utils/format';
import type { Proposal } from '@/lib/types';

interface ComparisonTableProps {
  proposals: Proposal[];
}

export function ComparisonTable({ proposals }: ComparisonTableProps) {
  // Find best values for comparison highlighting
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

  const metrics = [
    {
      icon: DollarSign,
      label: 'Total Price',
      getValue: (p: Proposal) => formatCurrency(p.totalPrice, p.currency),
      getBestIdx: () => lowestPriceIdx,
      renderExtra: (idx: number) => idx === lowestPriceIdx && <TrendingDown className="h-4 w-4" />,
    },
    {
      icon: Clock,
      label: 'Delivery Time',
      getValue: (p: Proposal) => p.deliveryDays ? `${p.deliveryDays} days` : 'N/A',
      getBestIdx: () => fastestDeliveryIdx,
      renderExtra: (idx: number, p: Proposal) =>
        idx === fastestDeliveryIdx && p.deliveryDays && <span className="text-green-600">✓</span>,
    },
    {
      icon: Shield,
      label: 'Warranty',
      getValue: (p: Proposal) => p.warrantyMonths ? `${p.warrantyMonths} months` : 'N/A',
      getBestIdx: () => longestWarrantyIdx,
      renderExtra: (idx: number, p: Proposal) =>
        idx === longestWarrantyIdx && p.warrantyMonths && <span className="text-green-600">✓</span>,
    },
    {
      icon: FileText,
      label: 'Payment Terms',
      getValue: (p: Proposal) => p.paymentTerms || 'N/A',
      getBestIdx: () => -1,
      renderExtra: () => null,
    },
  ];

  return (
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
                <TableHead key={proposal.id} className="text-center min-w-36">
                  <div className="flex flex-col items-center gap-1">
                    <span className="truncate max-w-28">{proposal.vendor.name}</span>
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
            {metrics.map(({ icon: Icon, label, getValue, getBestIdx, renderExtra }) => (
              <TableRow key={label}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {label}
                  </div>
                </TableCell>
                {proposals.map((proposal, idx) => {
                  const bestIdx = getBestIdx();
                  const isBest = bestIdx === idx;
                  return (
                    <TableCell
                      key={proposal.id}
                      className={`text-center ${
                        isBest ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {getValue(proposal)}
                        {renderExtra(idx, proposal)}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            {/* Status Row */}
            <TableRow>
              <TableCell className="font-medium">Status</TableCell>
              {proposals.map((proposal) => (
                <TableCell key={proposal.id} className="text-center">
                  <Badge variant="outline">{proposal.status}</Badge>
                </TableCell>
              ))}
            </TableRow>
            {/* AI Summary Row */}
            <TableRow>
              <TableCell className="font-medium align-top">AI Summary</TableCell>
              {proposals.map((proposal) => (
                <TableCell key={proposal.id} className="text-left">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {proposal.aiSummary || 'No AI analysis available'}
                  </p>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
