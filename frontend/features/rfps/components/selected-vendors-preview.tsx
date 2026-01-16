'use client';

import { CheckCircle2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Vendor } from '@/lib/types';

interface SelectedVendorsPreviewProps {
  selectedVendors: Set<string>;
  vendors: Vendor[];
  onRemove: (vendorId: string) => void;
  maxVisible?: number;
}

export function SelectedVendorsPreview({
  selectedVendors,
  vendors,
  onRemove,
  maxVisible = 4,
}: SelectedVendorsPreviewProps) {
  if (selectedVendors.size === 0) {
    return null;
  }

  const selectedArray = Array.from(selectedVendors);

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Selected Vendors
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {selectedArray.slice(0, maxVisible).map((vendorId) => {
            const vendor = vendors.find((v) => v.id === vendorId);
            if (!vendor) return null;
            return (
              <Badge key={vendorId} variant="outline" className="bg-background gap-1 pr-1">
                {vendor.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(vendorId);
                  }}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          {selectedVendors.size > maxVisible && (
            <Badge variant="secondary">+{selectedVendors.size - maxVisible} more</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
