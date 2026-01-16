'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useVendor, useVendors } from '@/features/vendors/hooks/use-vendors';
import { VendorFormFields, type VendorFormData } from '@/features/vendors';
import { NotFoundState } from '@/features/shared';
import { toast } from 'sonner';

export default function EditVendorPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;

  const { vendor, loading: loadingVendor, fetchVendor } = useVendor(vendorId);
  const { updateVendor, loading: updating } = useVendors();

  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    email: '',
    contactPerson: '',
    phone: '',
    address: '',
    status: 'ACTIVE',
    categories: [],
  });

  useEffect(() => {
    fetchVendor();
  }, [fetchVendor]);

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        email: vendor.email,
        contactPerson: vendor.contactPerson || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        status: vendor.status,
        categories: vendor.categories || [],
      });
    }
  }, [vendor]);

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

    const result = await updateVendor(vendorId, {
      name: formData.name.trim(),
      email: formData.email.trim(),
      contactPerson: formData.contactPerson.trim() || null,
      phone: formData.phone.trim() || null,
      address: formData.address.trim() || null,
      status: formData.status || 'ACTIVE',
      categories: formData.categories.length > 0 ? formData.categories : [],
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
      <div className="flex-1 p-6 space-y-6 max-w-2xl mx-auto w-full">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!vendor) {
    return <NotFoundState entity="Vendor" backHref="/vendors" backLabel="Back to Vendors" />;
  }

  return (
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
            <VendorFormFields 
              data={formData} 
              onChange={setFormData}
              showStatus
            />

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
  );
}