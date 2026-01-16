'use client';

import Link from 'next/link';
import { Search, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VendorListItem } from './vendor-list-item';
import type { Vendor } from '@/lib/types';

interface VendorSelectionCardProps {
  vendors: Vendor[];
  filteredVendors: Vendor[];
  selectedVendors: Set<string>;
  search: string;
  onSearchChange: (value: string) => void;
  onToggleVendor: (vendorId: string) => void;
  onToggleAll: () => void;
}

export function VendorSelectionCard({
  vendors,
  filteredVendors,
  selectedVendors,
  search,
  onSearchChange,
  onToggleVendor,
  onToggleAll,
}: VendorSelectionCardProps) {
  const allSelected = selectedVendors.size === filteredVendors.length && filteredVendors.length > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Select Vendors</CardTitle>
              <CardDescription>Choose vendors to receive this RFP</CardDescription>
            </div>
          </div>
          <Badge variant={selectedVendors.size > 0 ? 'default' : 'secondary'} className="h-7 px-3">
            {selectedVendors.size} of {filteredVendors.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Search and Actions */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAll}
            disabled={filteredVendors.length === 0}
            className="whitespace-nowrap"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        {/* Vendor List */}
        {filteredVendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <Users className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="mt-4 font-medium">
              {vendors.length === 0 ? 'No vendors yet' : 'No vendors found'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              {vendors.length === 0
                ? 'Add vendors to your network to send RFPs'
                : 'Try adjusting your search term'}
            </p>
            {vendors.length === 0 && (
              <Button className="mt-4" size="sm" asChild>
                <Link href="/vendors/create">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Vendor
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-100 overflow-y-auto pr-1">
            {filteredVendors.map((vendor) => (
              <VendorListItem
                key={vendor.id}
                vendor={vendor}
                isSelected={selectedVendors.has(vendor.id)}
                onToggle={onToggleVendor}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
