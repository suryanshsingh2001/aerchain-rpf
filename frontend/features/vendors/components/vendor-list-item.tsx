'use client';

import { Check, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Vendor } from '@/lib/types';

interface VendorListItemProps {
  vendor: Vendor;
  isSelected: boolean;
  onToggle: (vendorId: string) => void;
}

export function VendorListItem({ vendor, isSelected, onToggle }: VendorListItemProps) {
  return (
    <div
      className={`group flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? 'bg-primary/5 border-primary shadow-sm'
          : 'border-transparent bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/20'
      }`}
      onClick={() => onToggle(vendor.id)}
    >
      {/* Checkbox */}
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors ${
          isSelected
            ? 'bg-primary border-primary'
            : 'border-muted-foreground/30 group-hover:border-primary/50'
        }`}
      >
        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>

      {/* Avatar */}
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
          isSelected ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'
        }`}
      >
        <span
          className={`text-sm font-semibold ${
            isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
          }`}
        >
          {vendor.name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium">{vendor.name}</p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span className="truncate">{vendor.email}</span>
        </div>
      </div>

      {/* Categories */}
      {vendor.categories && vendor.categories.length > 0 && (
        <div className="hidden sm:flex flex-wrap gap-1 justify-end max-w-36">
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
}
