"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRfp, useRfps } from "@/hooks/use-rfps";
import { useVendors } from "@/hooks/use-vendors";
import {
  RfpSummaryPreview,
  SendSuccessView,
  VendorSelectionCard,
  SelectedVendorsPreview,
  SendActionBar,
  getStatusColor,
} from "@/features/rfps";
import { NotFoundState } from "@/features/shared";
import { toast } from "sonner";

export default function SendRfpPage() {
  const params = useParams();
  const router = useRouter();
  const rfpId = params.id as string;

  const { rfp, loading: rfpLoading, fetchRfp } = useRfp(rfpId);
  const { sendRfp, loading: sending } = useRfps();
  const { vendors, loading: vendorsLoading, fetchVendors } = useVendors();

  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(
    new Set()
  );
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchRfp();
    fetchVendors(1, 100);
  }, [fetchRfp, fetchVendors]);

  const filteredVendors = vendors.filter(
    (v) =>
      v.status === "ACTIVE" &&
      (v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.email.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleVendor = (vendorId: string) => {
    const newSelected = new Set(selectedVendors);
    if (newSelected.has(vendorId)) {
      newSelected.delete(vendorId);
    } else {
      newSelected.add(vendorId);
    }
    setSelectedVendors(newSelected);
  };

  const toggleAll = () => {
    if (selectedVendors.size === filteredVendors.length) {
      setSelectedVendors(new Set());
    } else {
      setSelectedVendors(new Set(filteredVendors.map((v) => v.id)));
    }
  };

  const handleSend = async () => {
    if (selectedVendors.size === 0) {
      toast.error("Please select at least one vendor");
      return;
    }

    const result = await sendRfp(rfpId, Array.from(selectedVendors));
    if (result) {
      setSuccess(true);
      toast.success(`RFP sent to ${selectedVendors.size} vendor(s)`);
    } else {
      toast.error("Failed to send RFP");
    }
  };

  const loading = rfpLoading || vendorsLoading;

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-125 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!rfp) {
    return (
      <NotFoundState entity="RFP" backHref="/rfps" backLabel="Back to RFPs" />
    );
  }

  if (success) {
    return <SendSuccessView rfpId={rfpId} vendorCount={selectedVendors.size} />;
  }

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/rfps/${rfpId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Send RFP to Vendors</h1>
            <p className="text-sm text-muted-foreground">
              Select vendors to receive this RFP
            </p>
          </div>
        </div>
        <Badge variant="outline" className={getStatusColor(rfp.status)}>
          {rfp.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - RFP Details */}
        <div className="space-y-4">
          <RfpSummaryPreview rfp={rfp} />
          <SelectedVendorsPreview
            selectedVendors={selectedVendors}
            vendors={vendors}
            onRemove={toggleVendor}
          />
        </div>

        {/* Right Column - Vendor Selection */}
        <div className="lg:col-span-2">
          <VendorSelectionCard
            vendors={vendors}
            filteredVendors={filteredVendors}
            selectedVendors={selectedVendors}
            search={search}
            onSearchChange={setSearch}
            onToggleVendor={toggleVendor}
            onToggleAll={toggleAll}
          />

          <SendActionBar
            rfpId={rfpId}
            selectedVendors={selectedVendors}
            vendors={vendors}
            sending={sending}
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  );
}
