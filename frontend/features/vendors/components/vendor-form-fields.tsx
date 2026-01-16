'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VendorStatus } from '@/lib/types';

export interface VendorFormData {
  name: string;
  email: string;
  contactPerson: string;
  phone: string;
  address: string;
  status?: VendorStatus;
  categories: string[];
}

interface VendorFormFieldsProps {
  data: VendorFormData;
  onChange: (data: VendorFormData) => void;
  showStatus?: boolean;
}

export function VendorFormFields({ data, onChange, showStatus = false }: VendorFormFieldsProps) {
  const [categoryInput, setCategoryInput] = useState('');

  const addCategory = () => {
    const trimmed = categoryInput.trim();
    if (trimmed && !data.categories.includes(trimmed)) {
      onChange({ ...data, categories: [...data.categories, trimmed] });
      setCategoryInput('');
    }
  };

  const removeCategory = (category: string) => {
    onChange({ ...data, categories: data.categories.filter((c) => c !== category) });
  };

  return (
    <div className="space-y-6">
      {/* Name & Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            placeholder="Acme Corp"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="sales@acme.com"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Contact Person & Phone */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            placeholder="John Doe"
            value={data.contactPerson}
            onChange={(e) => onChange({ ...data, contactPerson: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="+1 (555) 123-4567"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          placeholder="123 Business Ave, Suite 100, City, State, ZIP"
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          rows={2}
        />
      </div>

      {/* Status (only for edit) */}
      {showStatus && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={data.status || 'ACTIVE'}
            onValueChange={(value: VendorStatus) => onChange({ ...data, status: value })}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-2">
        <Label>Categories / Specializations</Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Electronics, IT Equipment"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCategory();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addCategory}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {data.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.categories.map((category) => (
              <Badge key={category} variant="secondary" className="gap-1.5 pr-1">
                {category}
                <button
                  type="button"
                  onClick={() => removeCategory(category)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
