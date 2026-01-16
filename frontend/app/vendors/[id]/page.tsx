'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2, FileText, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVendor, useVendors } from '@/hooks/use-vendors';
import {
  VendorDetailHeader,
  VendorDetailsTab,
  VendorRfpsTab,
  VendorProposalsTab,
  DeleteVendorDialog,
} from '@/features/vendors';
import { NotFoundState } from '@/features/shared';
import { toast } from 'sonner';

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;

  const { vendor, loading, fetchVendor } = useVendor(vendorId);
  const { deleteVendor } = useVendors();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchVendor();
  }, [fetchVendor]);

  const handleDelete = async () => {
    const success = await deleteVendor(vendorId);
    if (success) {
      toast.success('Vendor deleted successfully');
      router.push('/vendors');
    } else {
      toast.error('Failed to delete vendor');
    }
    setDeleteDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!vendor) {
    return <NotFoundState entity="Vendor" backHref="/vendors" backLabel="Back to Vendors" />;
  }

  const rfpCount = vendor.rfpVendors?.length || 0;
  const proposalCount = vendor.proposals?.length || 0;

  return (
    <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
      <VendorDetailHeader vendor={vendor} onDelete={() => setDeleteDialogOpen(true)} />

      {/* Tabs */}
      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger
            value="details"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Details</span>
          </TabsTrigger>
          <TabsTrigger
            value="rfps"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">RFPs</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {rfpCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="proposals"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Proposals</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {proposalCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <VendorDetailsTab vendor={vendor} />
        </TabsContent>

        <TabsContent value="rfps" className="space-y-6 mt-6">
          <VendorRfpsTab vendor={vendor} />
        </TabsContent>

        <TabsContent value="proposals" className="space-y-6 mt-6">
          <VendorProposalsTab vendor={vendor} />
        </TabsContent>
      </Tabs>

      <DeleteVendorDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        vendorName={vendor.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}