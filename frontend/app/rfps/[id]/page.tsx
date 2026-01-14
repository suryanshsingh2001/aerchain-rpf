'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  DollarSign,
  Calendar,
  FileText,
  Shield,
  Clock,
  Send,
  Users,
  Mail,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  BarChart3,
  Plus,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
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
import type { Rfp, RfpItem, RfpStatus, Proposal } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

function RfpStatusBadge({ status }: { status: RfpStatus }) {
  const config: Record<RfpStatus, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: typeof FileText; color: string }> = {
    DRAFT: { variant: 'secondary', icon: FileText, color: 'bg-gray-500' },
    SENT: { variant: 'default', icon: Mail, color: 'bg-blue-500' },
    EVALUATING: { variant: 'outline', icon: Clock, color: 'bg-yellow-500' },
    CLOSED: { variant: 'secondary', icon: CheckCircle2, color: 'bg-green-500' },
  };

  const { variant, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const formatCurrency = (value: string | null | undefined, currency = 'USD') => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-medium text-primary">
                {proposal.vendor.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <CardTitle className="text-base">{proposal.vendor.name}</CardTitle>
              <CardDescription>{proposal.vendor.email}</CardDescription>
            </div>
          </div>
          {proposal.aiScore && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{proposal.aiScore}</div>
              <div className="text-xs text-muted-foreground">AI Score</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Price</p>
            <p className="font-medium">{formatCurrency(proposal.totalPrice, proposal.currency)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Delivery</p>
            <p className="font-medium">
              {proposal.deliveryDays ? `${proposal.deliveryDays} days` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Warranty</p>
            <p className="font-medium">
              {proposal.warrantyMonths ? `${proposal.warrantyMonths} months` : 'N/A'}
            </p>
          </div>
        </div>
        
        {proposal.aiSummary && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm">{proposal.aiSummary}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Badge variant={
            proposal.status === 'EVALUATED' ? 'default' :
            proposal.status === 'PARSED' ? 'secondary' : 'outline'
          }>
            {proposal.status}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Received {formatDistanceToNow(new Date(proposal.receivedAt), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RfpDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rfpId = params.id as string;
  
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

  const formatCurrency = (value: string | null | undefined, currency = 'USD') => {
    if (!value) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="RFP Details" />
        <div className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !rfp) {
    return (
      <div className="flex flex-col h-full">
        <Header title="RFP Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto" />
            <h2 className="mt-4 text-lg font-semibold">RFP not found</h2>
            <p className="mt-2 text-muted-foreground">
              The RFP you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/rfps">Back to RFPs</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title={rfp.title}
        breadcrumbs={[
          { label: 'RFPs', href: '/rfps' },
          { label: rfp.title },
        ]}
      />

      <div className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Actions */}
        <div className="flex items-center justify-end">
          <div className="flex gap-2">
            {rfp.status === 'DRAFT' && (
              <Button asChild>
                <Link href={`/rfps/${rfp.id}/send`}>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Vendors
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="vendors">
              Vendors ({rfp.rfpVendors?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="proposals">
              Proposals ({proposals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{rfp.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Created {format(new Date(rfp.createdAt), 'PPP')}
                    </CardDescription>
                  </div>
                  <RfpStatusBadge status={rfp.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {rfp.description && (
                  <p className="text-muted-foreground">{rfp.description}</p>
                )}

                {/* Items */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Items Required
                  </h4>
                  <div className="space-y-2">
                    {(rfp.items as RfpItem[]).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 rounded-lg border bg-muted/30"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.specifications && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.specifications}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">
                          Qty: {item.quantity} {item.unit || ''}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Terms Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Budget</span>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(rfp.budget, rfp.currency)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Delivery</span>
                    </div>
                    <p className="font-medium">
                      {rfp.deliveryDays
                        ? `${rfp.deliveryDays} days`
                        : 'Not specified'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Payment Terms</span>
                    </div>
                    <p className="font-medium">
                      {rfp.paymentTerms || 'Not specified'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">Warranty</span>
                    </div>
                    <p className="font-medium">
                      {rfp.warrantyMonths
                        ? `${rfp.warrantyMonths} months`
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Original Input</CardTitle>
                <CardDescription>
                  The natural language description used to generate this RFP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm italic">&quot;{rfp.originalInput}&quot;</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Selected Vendors</CardTitle>
                  <CardDescription>
                    Vendors this RFP was sent to
                  </CardDescription>
                </div>
                {rfp.status === 'DRAFT' && (
                  <Button asChild>
                    <Link href={`/rfps/${rfp.id}/send`}>
                      <Send className="mr-2 h-4 w-4" />
                      Send to Vendors
                    </Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {!rfp.rfpVendors || rfp.rfpVendors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No vendors selected yet
                    </p>
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
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-medium text-primary">
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
                          variant={
                            rv.emailStatus === 'SENT'
                              ? 'default'
                              : rv.emailStatus === 'FAILED'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {rv.emailStatus === 'SENT' ? (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          ) : null}
                          {rv.emailStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-6">
            {/* Compare Button */}
            {proposals.length > 0 && (
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">
                  {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} received
                </p>
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
            )}

            {/* AI Recommendation */}
            {comparison && (
              <Card className="border-green-500/50 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-green-500" />
                    AI Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{comparison.recommendation.vendorName}</p>
                      <p className="text-muted-foreground text-sm">Recommended Vendor</p>
                    </div>
                  </div>
                  <p className="text-sm">{comparison.recommendation.reasoning}</p>
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
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Mail className="h-16 w-16 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No proposals yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                    Proposals will appear here when vendors respond to this RFP via email.
                  </p>
                  <Button className="mt-4" variant="outline" asChild>
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
      </div>

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
    </div>
  );
}
