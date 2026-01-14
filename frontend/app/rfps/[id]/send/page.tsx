'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  Check,
  Users,
  Mail,
  Loader2,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useRfp, useRfps } from '@/hooks/use-rfps';
import { useVendors } from '@/hooks/use-vendors';
import type { Vendor } from '@/lib/types';
import { toast } from 'sonner';

export default function SendRfpPage() {
  const params = useParams();
  const router = useRouter();
  const rfpId = params.id as string;

  const { rfp, loading: rfpLoading, fetchRfp } = useRfp(rfpId);
  const { sendRfp, loading: sending } = useRfps();
  const { vendors, loading: vendorsLoading, fetchVendors } = useVendors();

  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchRfp();
    fetchVendors(1, 100);
  }, [fetchRfp, fetchVendors]);

  const filteredVendors = vendors.filter(
    (v) =>
      v.status === 'ACTIVE' &&
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
      toast.error('Please select at least one vendor');
      return;
    }

    const result = await sendRfp(rfpId, Array.from(selectedVendors));
    if (result) {
      setSuccess(true);
      toast.success(`RFP sent to ${selectedVendors.size} vendor(s)`);
    } else {
      toast.error('Failed to send RFP');
    }
  };

  const loading = rfpLoading || vendorsLoading;

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Send RFP" />
        <div className="flex-1 p-6 space-y-6 max-w-3xl mx-auto w-full">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="flex flex-col h-full">
        <Header title="RFP Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold">RFP not found</h2>
            <Button className="mt-4" asChild>
              <Link href="/rfps">Back to RFPs</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col h-full">
        <Header title="RFP Sent" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">RFP Sent Successfully!</h2>
              <p className="text-muted-foreground mb-6">
                Your RFP has been sent to {selectedVendors.size} vendor(s). They will receive
                an email with all the details.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/rfps">Back to RFPs</Link>
                </Button>
                <Button asChild>
                  <Link href={`/rfps/${rfpId}`}>View RFP</Link>
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
        title="Send RFP"
        description={`Select vendors to receive "${rfp.title}"`}
        breadcrumbs={[
          { label: 'RFPs', href: '/rfps' },
          { label: rfp.title, href: `/rfps/${rfpId}` },
          { label: 'Send' },
        ]}
      />

      <div className="flex-1 p-6 space-y-6 max-w-3xl mx-auto w-full">
        {/* RFP Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">RFP Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{rfp.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {rfp.description || rfp.originalInput}
                </p>
              </div>
              <Badge>{rfp.status}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Select Vendors</CardTitle>
                <CardDescription>
                  Choose which vendors should receive this RFP
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {selectedVendors.size} selected
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Select All */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                onClick={toggleAll}
                disabled={filteredVendors.length === 0}
              >
                {selectedVendors.size === filteredVendors.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>
            </div>

            {/* Vendor List */}
            {filteredVendors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {vendors.length === 0
                    ? 'No vendors available. Add vendors first.'
                    : 'No vendors match your search.'}
                </p>
                {vendors.length === 0 && (
                  <Button className="mt-4" size="sm" asChild>
                    <Link href="/vendors/create">Add Vendor</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedVendors.has(vendor.id)
                        ? 'bg-primary/5 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleVendor(vendor.id)}
                  >
                    <Checkbox
                      checked={selectedVendors.has(vendor.id)}
                      onCheckedChange={() => toggleVendor(vendor.id)}
                    />
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-medium text-primary">
                        {vendor.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{vendor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.email}
                      </p>
                    </div>
                    {vendor.categories && vendor.categories.length > 0 && (
                      <div className="flex gap-1">
                        {vendor.categories.slice(0, 2).map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Send Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href={`/rfps/${rfpId}`}>Cancel</Link>
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || selectedVendors.size === 0}
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send to {selectedVendors.size} Vendor(s)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
