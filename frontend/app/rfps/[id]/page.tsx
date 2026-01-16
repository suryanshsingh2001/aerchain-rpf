'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, Users, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRfp, useRfps } from '@/features/rfps/hooks/use-rfps';
import { useProposals } from '@/features/proposals/hooks/use-proposals';
import {
  RfpDetailHeader,
  RfpDetailsTab,
  RfpVendorsTab,
  RfpProposalsTab,
  RfpPrintContent,
  DeleteRfpDialog,
} from '@/features/rfps';
import { NotFoundState } from '@/features/shared';
import { toast } from 'sonner';

export default function RfpDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rfpId = params.id as string;

  const { rfp, loading, error, fetchRfp } = useRfp(rfpId);
  const { deleteRfp } = useRfps();
  const {
    proposals,
    loading: proposalsLoading,
    fetchProposals,
    comparison,
    comparing,
    compareProposals,
  } = useProposals(rfpId);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchRfp();
    fetchProposals();
  }, [fetchRfp, fetchProposals]);

  const handleDelete = async () => {
    const success = await deleteRfp(rfpId);
    if (success) {
      toast.success('RFP deleted successfully');
      router.push('/rfps');
    } else {
      toast.error('Failed to delete RFP');
    }
    setDeleteDialogOpen(false);
  };

  const handleCompare = async () => {
    const result = await compareProposals();
    if (result) {
      toast.success('Proposals compared successfully!');
      fetchProposals();
    } else {
      toast.error('Failed to compare proposals');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !rfp) {
    return <NotFoundState entity="RFP" backHref="/rfps" backLabel="Back to RFPs" />;
  }

  return (
    <div className="flex-1 p-6 space-y-6 container max-w-6xl mx-auto w-full">
      <RfpDetailHeader rfp={rfp} onPrint={handlePrint} onDelete={() => setDeleteDialogOpen(true)} />

      <RfpPrintContent rfp={rfp} />

      {/* Tabs */}
      <Tabs defaultValue="details" className="print:hidden">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger
            value="details"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Details</span>
          </TabsTrigger>
          <TabsTrigger
            value="vendors"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Vendors</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {rfp.rfpVendors?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="proposals"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Proposals</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {proposals.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <RfpDetailsTab rfp={rfp} />
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6 mt-6">
          <RfpVendorsTab rfp={rfp} />
        </TabsContent>

        <TabsContent value="proposals" className="space-y-6 mt-6">
          <RfpProposalsTab
            rfp={rfp}
            proposals={proposals}
            loading={proposalsLoading}
            comparing={comparing}
            comparison={comparison}
            onCompare={handleCompare}
          />
        </TabsContent>
      </Tabs>

      <DeleteRfpDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        rfpTitle={rfp.title}
        onConfirm={handleDelete}
      />
    </div>
  );
}