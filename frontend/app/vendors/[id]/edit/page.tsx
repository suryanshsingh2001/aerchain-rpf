'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  Save,
  Plus,
  X,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useVendor, useVendors } from '@/hooks/use-vendors';
import type { VendorStatus } from '@/lib/types';
import { toast } from 'sonner';

export default function EditVendorPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;

  const { vendor, loading: loadingVendor, fetchVendor } = useVendor(vendorId);
  const { updateVendor, loading: updating } = useVendors();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<VendorStatus>('ACTIVE');
  const [categoryInput, setCategoryInput] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchVendor();
  }, [fetchVendor]);

  useEffect(() => {
    if (vendor) {
      setName(vendor.name);
      setEmail(vendor.email);
      setContactPerson(vendor.contactPerson || '');
      setPhone(vendor.phone || '');
      setAddress(vendor.address || '');
      setStatus(vendor.status);
      setCategories(vendor.categories || []);
    }
  }, [vendor]);

  const addCategory = () => {
    const trimmed = categoryInput.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setCategoryInput('');
    }
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a vendor name');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const result = await updateVendor(vendorId, {
      name: name.trim(),
      email: email.trim(),
      contactPerson: contactPerson.trim() || null,
      phone: phone.trim() || null,
      address: address.trim() || null,
      status,
      categories: categories.length > 0 ? categories : [],
    });

    if (result) {
      toast.success('Vendor updated successfully!');
      router.push(`/vendors/${vendorId}`);
    } else {
      toast.error('Failed to update vendor');
    }
  };

  if (loadingVendor) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Edit Vendor" />
        <div className="flex-1 p-6 space-y-6 max-w-2xl mx-auto w-full">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Vendor Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Vendor not found</h2>
            <Button className="mt-4" asChild>
              <Link href="/vendors">Back to Vendors</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Edit Vendor"
        description={`Update ${vendor.name}'s information`}
        breadcrumbs={[
          { label: 'Vendors', href: '/vendors' },
          { label: vendor.name, href: `/vendors/${vendorId}` },
          { label: 'Edit' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6 max-w-2xl mx-auto w-full">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
              <CardDescription>
                Update the vendor&apos;s contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name & Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as VendorStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => removeCategory(cat)}
                          className="ml-1 rounded-full p-0.5 hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/vendors/${vendorId}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
