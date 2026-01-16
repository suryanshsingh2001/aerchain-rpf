'use client';

import { Package, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Rfp, RfpItem } from '@/lib/types';
import { RfpItemsList } from './rfp-items-list';
import { formatCurrency } from '../utils/format';

interface RfpSummaryCardProps {
  rfp: Rfp;
  maxItems?: number;
}

export function RfpSummaryCard({ rfp, maxItems = 3 }: RfpSummaryCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 border-b pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          RFP Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold line-clamp-2">{rfp.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
            {rfp.description || rfp.originalInput}
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="font-medium">{formatCurrency(rfp.budget, rfp.currency)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Delivery</p>
              <p className="font-medium">
                {rfp.deliveryDays ? `${rfp.deliveryDays} days` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <RfpItemsList items={rfp.items as RfpItem[]} variant="compact" maxItems={maxItems} />
      </CardContent>
    </Card>
  );
}
