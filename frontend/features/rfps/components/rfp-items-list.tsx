'use client';

import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RfpItem } from '@/lib/types';

interface RfpItemsListProps {
  items: RfpItem[];
  variant?: 'default' | 'compact';
  maxItems?: number;
}

export function RfpItemsList({ items, variant = 'default', maxItems }: RfpItemsListProps) {
  const displayItems = maxItems ? items.slice(0, maxItems) : items;
  const remainingCount = maxItems && items.length > maxItems ? items.length - maxItems : 0;

  if (variant === 'compact') {
    return (
      <div>
        <p className="text-xs text-muted-foreground mb-2">Items ({items.length})</p>
        <div className="space-y-1.5">
          {displayItems.map((item, index) => (
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
          {remainingCount > 0 && (
            <p className="text-xs text-muted-foreground text-center py-1">
              +{remainingCount} more items
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />
        Items Required
      </h4>
      <div className="space-y-3">
        {displayItems.map((item, index) => (
          <div
            key={index}
            className="flex items-start justify-between p-4 rounded-xl border bg-gradient-to-r from-muted/50 to-transparent hover:from-muted/80 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                {index + 1}
              </div>
              <div>
                <p className="font-medium">{item.name}</p>
                {item.specifications && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.specifications}
                  </p>
                )}
              </div>
            </div>
            <Badge variant="outline" className="bg-background font-medium">
              {item.quantity} {item.unit || 'units'}
            </Badge>
          </div>
        ))}
        {remainingCount > 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            +{remainingCount} more items
          </p>
        )}
      </div>
    </div>
  );
}
