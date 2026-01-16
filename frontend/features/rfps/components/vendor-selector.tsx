'use client';

import { Users, Mail, Check, X, UserPlus, Search } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Vendor } from '@/lib/types';

interface VendorSelectorProps {
  vendors: Vendor[];
  filteredVendors: Vendor[];
  selectedVendors: Set<string>;
  search: string;
  onSearchChange: (search: string) => void;
  onToggleVendor: (vendorId: string) => void;
  onToggleAll: () => void;
}

export function VendorSelector({
  vendors,
  filteredVendors,
  selectedVendors,
  search,
  onSearchChange,
  onToggleVendor,
  onToggleAll,
}: VendorSelectorProps) {
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
          <div className="flex items-center gap-2">
            <Badge
              variant={selectedVendors.size > 0 ? 'default' : 'secondary'}
              className="h-7 px-3"
            >
              {selectedVendors.size} of {filteredVendors.length}
            </Badge>
          </div>
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
            {selectedVendors.size === filteredVendors.length && filteredVendors.length > 0
              ? 'Deselect All'
              : 'Select All'}
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
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredVendors.map((vendor) => {
              const isSelected = selectedVendors.has(vendor.id);
              return (
                <div
                  key={vendor.id}
                  className={`group flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary/5 border-primary shadow-sm'
                      : 'border-transparent bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/20'
                  }`}
                  onClick={() => onToggleVendor(vendor.id)}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground/30 group-hover:border-primary/50'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                      isSelected
                        ? 'bg-primary/20'
                        : 'bg-muted group-hover:bg-primary/10'
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        isSelected
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-primary'
                      }`}
                    >
                      {vendor.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{vendor.name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  </div>
                  {vendor.categories && vendor.categories.length > 0 && (
                    <div className="hidden sm:flex flex-wrap gap-1 justify-end max-w-[150px]">
                      {vendor.categories.slice(0, 2).map((cat) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className="text-xs bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300"
                        >
                          {cat}
                        </Badge>
                      ))}
                      {vendor.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{vendor.categories.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
