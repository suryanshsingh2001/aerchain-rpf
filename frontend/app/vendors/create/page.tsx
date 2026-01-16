'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useVendors } from '@/hooks/use-vendors';
import { VendorFormFields, type VendorFormData } from '@/features/vendors';
import { SuccessCard } from '@/features/shared';
import { toast } from 'sonner';

const initialFormData: VendorFormData = {
  name: '',
  email: '',
  contactPerson: '',
  phone: '',
  address: '',
  categories: [],
};

export default function CreateVendorPage() {
  const { createVendor, loading } = useVendors();

  const [formData, setFormData] = useState<VendorFormData>(initialFormData);
  const [success, setSuccess] = useState(false);
  const [createdVendorId, setCreatedVendorId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a vendor name');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const vendor = await createVendor({
      name: formData.name.trim(),
      email: formData.email.trim(),
      contactPerson: formData.contactPerson.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      address: formData.address.trim() || undefined,
      categories: formData.categories.length > 0 ? formData.categories : undefined,
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
      <div className="flex-1 flex items-center justify-center p-6">
        <SuccessCard
          title="Vendor Created!"
          description={`${formData.name} has been added to your vendor network.`}
          primaryAction={{
            label: 'View Vendor',
            href: createdVendorId ? `/vendors/${createdVendorId}` : '/vendors',
          }}
          secondaryAction={{
            label: 'Add Another',
            onClick: () => {
              setSuccess(false);
              setFormData(initialFormData);
              setCreatedVendorId(null);
            },
          }}
        />
      </div>
    );
  }

  return (
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
            <VendorFormFields data={formData} onChange={setFormData} />

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
  );
}
