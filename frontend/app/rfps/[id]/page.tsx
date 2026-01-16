'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  DollarSign,
  Calendar,
  FileText,
  Shield,
  Send,
  Users,
  Mail,
  Sparkles,
  Trash2,
  CheckCircle2,
  BarChart3,
  Plus,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRfp, useRfps } from '@/hooks/use-rfps';
import { useProposals } from '@/hooks/use-proposals';
import { RfpStatusBadge, ProposalCard, formatCurrency } from '@/features/rfps';
import { NotFoundState } from '@/features/shared';
import type { Rfp, RfpItem, RfpStatus, Proposal } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function RfpDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rfpId = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);
  
  const { rfp, loading, error, fetchRfp } = useRfp(rfpId);
  const { deleteRfp } = useRfps();
  const { proposals, loading: proposalsLoading, fetchProposals, comparison, comparing, compareProposals } = useProposals(rfpId);
  
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
      fetchProposals(); // Refresh proposals with new scores
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
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{rfp.title}</h1>
            <RfpStatusBadge status={rfp.status} />
          </div>
          <p className="text-muted-foreground">
            Created {format(new Date(rfp.createdAt), 'PPP')} • {formatDistanceToNow(new Date(rfp.createdAt), { addSuffix: true })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print / PDF
          </Button>
          {rfp.status === 'DRAFT' && (
            <Button size="sm" asChild>
              <Link href={`/rfps/${rfp.id}/send`}>
                <Send className="h-4 w-4" />
                Send to Vendors
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block print:mb-8">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">{rfp.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Created {format(new Date(rfp.createdAt), 'PPP')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Request for Proposal</p>
            <RfpStatusBadge status={rfp.status} />
          </div>
        </div>
      </div>

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
            {/* Overview Card */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">RFP Overview</CardTitle>
                    <CardDescription>Requirements and specifications</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {rfp.description && (
                  <p className="text-muted-foreground">{rfp.description}</p>
                )}

                {/* Items */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Items Required
                  </h4>
                  <div className="space-y-3">
                    {(rfp.items as RfpItem[]).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-4 rounded-xl border bg-gradient-to-r from-muted/50 to-transparent hover:from-muted/80 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.specifications && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.specifications}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-background font-medium">
                          {item.quantity} {item.unit || 'units'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Terms Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">Budget</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {formatCurrency(rfp.budget, rfp.currency)}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Delivery</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {rfp.deliveryDays
                        ? `${rfp.deliveryDays} days`
                        : 'Not specified'}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">Payment</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {rfp.paymentTerms || 'Not specified'}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Warranty</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {rfp.warrantyMonths
                        ? `${rfp.warrantyMonths} mo`
                        : 'Not specified'}
                    </p>
                  </div>
                </div>

                {rfp.additionalTerms && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Additional Terms</h4>
                      <p className="text-sm text-muted-foreground">
                        {rfp.additionalTerms}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Original Input */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-violet-500/10 p-2">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Original Request</CardTitle>
                    <CardDescription>Natural language input used to generate this RFP</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="rounded-xl bg-muted/50 p-5 border-l-4 border-violet-500">
                  <p className="text-sm leading-relaxed italic text-muted-foreground">&quot;{rfp.originalInput}&quot;</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6 mt-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Selected Vendors</CardTitle>
                    <CardDescription>Vendors this RFP was sent to</CardDescription>
                  </div>
                </div>
                {rfp.status === 'DRAFT' && (
                  <Button size="sm" asChild>
                    <Link href={`/rfps/${rfp.id}/send`}>
                      <Plus className="h-4 w-4" />
                      Add Vendors
                    </Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {!rfp.rfpVendors || rfp.rfpVendors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4">
                      <Users className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="mt-4 text-sm font-medium">No vendors selected yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Select vendors to send this RFP</p>
                    <Button className="mt-4" size="sm" asChild>
                      <Link href={`/rfps/${rfp.id}/send`}>
                        Select Vendors
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rfp.rfpVendors.map((rv) => (
                      <div
                        key={rv.id}
                        className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                            <span className="text-sm font-semibold text-primary">
                              {rv.vendor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{rv.vendor.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {rv.vendor.email}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`font-medium ${
                            rv.emailStatus === 'SENT'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                              : rv.emailStatus === 'FAILED'
                              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {rv.emailStatus === 'SENT' && (
                            <CheckCircle2 className="mr-1.5 h-3 w-3" />
                          )}
                          {rv.emailStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-6 mt-6">
            {/* Compare Button */}
            {proposals.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl bg-muted/30 border">
                <div>
                  <p className="font-medium">
                    {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} received
                  </p>
                  <p className="text-sm text-muted-foreground">Compare and analyze with AI</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCompare} disabled={comparing}>
                    {comparing ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Compare Proposals
                      </>
                    )}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/rfps/${rfp.id}/compare`}>
                      View Full Comparison
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* AI Recommendation */}
            {comparison && (
              <Card className="border-emerald-500/50 bg-gradient-to-br from-emerald-500/5 to-transparent overflow-hidden">
                <CardHeader className="border-b border-emerald-500/20">
                  <CardTitle className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-500/10 p-2">
                      <Sparkles className="h-5 w-5 text-emerald-500" />
                    </div>
                    AI Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                      <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-xl">{comparison.recommendation.vendorName}</p>
                      <p className="text-muted-foreground text-sm">Recommended Vendor</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{comparison.recommendation.reasoning}</p>
                  <Separator />
                  <p className="text-sm text-muted-foreground">{comparison.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Proposals Grid */}
            {proposalsLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : proposals.length === 0 ? (
              <Card className="overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-full bg-muted p-4">
                    <Mail className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No proposals yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                    Proposals will appear here when vendors respond to this RFP via email.
                  </p>
                  <Button className="mt-6" variant="outline" asChild>
                    <Link href={`/rfps/${rfp.id}/add-proposal`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Proposal Manually
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {proposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete RFP</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{rfp.title}&quot;? This action
              cannot be undone and will also delete all associated proposals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Print-only content - Full RFP for PDF export */}
      <div className="hidden print:block print:space-y-6">
        {/* Description */}
        {rfp.description && (
          <div className="mb-4">
            <p className="text-muted-foreground">{rfp.description}</p>
          </div>
        )}

        {/* Items */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Items Required</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">#</th>
                <th className="text-left py-2 font-medium">Item</th>
                <th className="text-left py-2 font-medium">Specifications</th>
                <th className="text-right py-2 font-medium">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {(rfp.items as RfpItem[]).map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2 font-medium">{item.name}</td>
                  <td className="py-2 text-muted-foreground">{item.specifications || '-'}</td>
                  <td className="py-2 text-right">{item.quantity} {item.unit || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Terms */}
        <div className="grid grid-cols-4 gap-4 border rounded-lg p-4 mt-6">
          <div>
            <p className="text-sm text-muted-foreground">Budget</p>
            <p className="font-semibold">{formatCurrency(rfp.budget, rfp.currency)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Delivery</p>
            <p className="font-semibold">{rfp.deliveryDays ? `${rfp.deliveryDays} days` : 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payment Terms</p>
            <p className="font-semibold">{rfp.paymentTerms || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Warranty</p>
            <p className="font-semibold">{rfp.warrantyMonths ? `${rfp.warrantyMonths} months` : 'Not specified'}</p>
          </div>
        </div>

        {/* Additional Terms */}
        {rfp.additionalTerms && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Additional Terms</h3>
            <p className="text-muted-foreground">{rfp.additionalTerms}</p>
          </div>
        )}

        {/* Vendors */}
        {rfp.rfpVendors && rfp.rfpVendors.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-3">Selected Vendors</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Vendor</th>
                  <th className="text-left py-2 font-medium">Email</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rfp.rfpVendors.map((rv) => (
                  <tr key={rv.id} className="border-b">
                    <td className="py-2 font-medium">{rv.vendor.name}</td>
                    <td className="py-2">{rv.vendor.email}</td>
                    <td className="py-2">{rv.emailStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-sm text-muted-foreground text-center">
          Generated on {format(new Date(), 'PPP')} • RFP ID: {rfp.id}
        </div>
      </div>
    </div>
  );
}