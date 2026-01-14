'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  Plus,
  X,
  CheckCircle2,
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useVendors } from '@/hooks/use-vendors';
import { toast } from 'sonner';

export default function CreateVendorPage() {
  const router = useRouter();
  const { createVendor, loading } = useVendors();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [createdVendorId, setCreatedVendorId] = useState<string | null>(null);

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

    const vendor = await createVendor({
      name: name.trim(),
      email: email.trim(),
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      categories: categories.length > 0 ? categories : undefined,
    });

    if (vendor) {
      setSuccess(true);
      setCreatedVendorId(vendor.id);
      toast.success('Vendor created successfully!');
    } else {
      toast.error('Failed to create vendor');
    }
  };

  if (success) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Vendor Created" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Vendor Created!</h2>
              <p className="text-muted-foreground mb-6">
                {name} has been added to your vendor network.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSuccess(false);
                    setName('');
                    setEmail('');
                    setContactPerson('');
                    setPhone('');
                    setAddress('');
                    setCategories([]);
                    setCreatedVendorId(null);
                  }}
                >
                  Add Another
                </Button>
                <Button asChild>
                  <Link href={createdVendorId ? `/vendors/${createdVendorId}` : '/vendors'}>
                    View Vendor
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Add Vendor"
        description="Add a new vendor to your network"
        breadcrumbs={[
          { label: 'Vendors', href: '/vendors' },
          { label: 'Create' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6 max-w-2xl mx-auto w-full">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
              <CardDescription>
                Enter the vendor&apos;s contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name & Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    placeholder="Acme Corp"
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
                    placeholder="sales@acme.com"
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
                    placeholder="John Doe"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
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
                  placeholder="123 Business Ave, Suite 100, City, State, ZIP"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                />
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
                  <Link href="/vendors">Cancel</Link>
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Vendor
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
