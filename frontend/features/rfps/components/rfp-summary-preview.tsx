'use client';

import { Package, DollarSign, Calendar } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Rfp, RfpItem } from '@/lib/types';
import { formatCurrency } from '../utils';

interface RfpSummaryPreviewProps {
  rfp: Rfp;
  maxItems?: number;
}

export function RfpSummaryPreview({ rfp, maxItems = 3 }: RfpSummaryPreviewProps) {
  const items = rfp.items as RfpItem[];

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
              <p className="font-medium">{rfp.deliveryDays ? `${rfp.deliveryDays} days` : 'N/A'}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-xs text-muted-foreground mb-2">Items ({items.length})</p>
          <div className="space-y-1.5">
            {items.slice(0, maxItems).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2"
              >
                <span className="truncate flex-1">{item.name}</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.quantity}
                </Badge>
              </div>
            ))}
            {items.length > maxItems && (
              <p className="text-xs text-muted-foreground text-center py-1">
                +{items.length - maxItems} more items
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
