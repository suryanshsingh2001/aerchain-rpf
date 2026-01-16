'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useRfp } from '@/hooks/use-rfps';
import { useVendors } from '@/hooks/use-vendors';
import { useProposals } from '@/hooks/use-proposals';
import { SuccessCard, NotFoundState } from '@/features/shared';
import { toast } from 'sonner';

export default function AddProposalPage() {
  const params = useParams();
  const rfpId = params.id as string;

  const { rfp, loading: rfpLoading, fetchRfp } = useRfp(rfpId);
  const { vendors, loading: vendorsLoading, fetchVendors } = useVendors();
  const { createProposal, loading: submitting } = useProposals(rfpId);

  const [vendorId, setVendorId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchRfp();
    fetchVendors(1, 100);
  }, [fetchRfp, fetchVendors]);

  const handleSubmit = async () => {
    if (!vendorId) {
      toast.error('Please select a vendor');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter the proposal content');
      return;
    }

    const result = await createProposal({
      vendorId,
      rawContent: content,
      rawSubject: subject || undefined,
    });

    if (result) {
      setSuccess(true);
      toast.success('Proposal added and parsed by AI!');
    } else {
      toast.error('Failed to add proposal');
    }
  };

  const loading = rfpLoading || vendorsLoading;

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6 max-w-3xl mx-auto w-full">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!rfp) {
    return <NotFoundState entity="RFP" backHref="/rfps" backLabel="Back to RFPs" />;
  }

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <SuccessCard
          title="Proposal Added!"
          description="The proposal has been parsed by AI and added to this RFP."
          primaryAction={{
            label: 'View RFP',
            href: `/rfps/${rfpId}`,
          }}
          secondaryAction={{
            label: 'Add Another',
            onClick: () => {
              setSuccess(false);
              setVendorId('');
              setSubject('');
              setContent('');
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 max-w-3xl mx-auto w-full">
      <Card>
          <CardHeader>
            <CardTitle>Vendor Proposal</CardTitle>
            <CardDescription>
              Paste the vendor&apos;s response and our AI will extract the important details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vendor Selection */}
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor *</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger id="vendor">
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors
                    .filter((v) => v.status === 'ACTIVE')
                    .map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name} ({vendor.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject (Optional)</Label>
              <Input
                id="subject"
                placeholder="Re: RFP - Office Equipment"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Proposal Content *</Label>
              <Textarea
                id="content"
                placeholder="Paste the vendor's email or proposal content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Include all details: pricing, delivery terms, warranty, etc.
              </p>
            </div>

            {/* AI Notice */}
            <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 p-4">
              <div className="flex items-center gap-2 text-violet-700">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">AI-Powered Parsing</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Our AI will automatically extract pricing, terms, conditions, and
                other important details from the proposal content.
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" asChild>
                <Link href={`/rfps/${rfpId}`}>Cancel</Link>
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Proposal
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}