'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  Clock,
  Users,
  Building2,
  Tag,
  ArrowLeft,
  XCircle,
  Send,
  Sparkles,
  BarChart3,
  Edit,
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
import { useVendor, useVendors } from '@/hooks/use-vendors';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

function VendorStatusBadge({ status }: { status: 'ACTIVE' | 'INACTIVE' }) {
  if (status === 'ACTIVE') {
    return (
      <Badge variant="outline" className="gap-1.5 font-medium px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1.5 font-medium px-3 py-1 bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300">
      <XCircle className="h-3.5 w-3.5" />
      Inactive
    </Badge>
  );
}

function EmailStatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; icon: typeof Mail }> = {
    SENT: { 
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300', 
      icon: CheckCircle2 
    },
    PENDING: { 
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300', 
      icon: Clock 
    },
    FAILED: { 
      className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300', 
      icon: XCircle 
    },
  };

  const { className, icon: Icon } = config[status] || config.PENDING;

  return (
    <Badge variant="outline" className={`gap-1 font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

function ProposalStatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    EVALUATED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
    PARSED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
    RECEIVED: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
  };

  return (
    <Badge variant="outline" className={`font-medium ${config[status] || config.RECEIVED}`}>
      {status}
    </Badge>
  );
}

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
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-semibold">Vendor not found</h2>
          <p className="mt-2 text-muted-foreground max-w-sm">
            The vendor you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/vendors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vendors
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const rfpCount = vendor.rfpVendors?.length || 0;
  const proposalCount = vendor.proposals?.length || 0;

  return (
    <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="mt-1">
            <Link href="/vendors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border">
            <span className="text-2xl font-bold text-primary">
              {vendor.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{vendor.name}</h1>
            <p className="text-muted-foreground">
              Added {format(new Date(vendor.createdAt), 'PPP')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <VendorStatusBadge status={vendor.status} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end print:hidden">
        <Button variant="outline" asChild>
          <Link href={`/vendors/${vendorId}/edit`}>
            <Edit className="h-4 w-4" />
            Edit Vendor
          </Link>
        </Button>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="">
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

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6 mt-6">
          {/* Contact Information Card */}
          <Card className="overflow-hidden  ">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                  <CardDescription>Vendor contact details and location</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-4 p-4 rounded-xl">
                  <div className="rounded-lg bg-blue-500/10 p-2.5">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                    <a
                      href={`mailto:${vendor.email}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {vendor.email}
                    </a>
                  </div>
                </div>
                
                {vendor.phone && (
                  <div className="flex items-start gap-4 p-4 rounded-xl">
                    <div className="rounded-lg bg-emerald-500/10 p-2.5">
                      <Phone className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                      <a href={`tel:${vendor.phone}`} className="font-medium hover:underline">
                        {vendor.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {vendor.contactPerson && (
                  <div className="flex items-start gap-4 p-4 rounded-xl">
                    <div className="rounded-lg bg-violet-500/10 p-2.5">
                      <Users className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                      <p className="font-medium">{vendor.contactPerson}</p>
                    </div>
                  </div>
                )}
                
                {vendor.address && (
                  <div className="flex items-start gap-4 p-4 rounded-xl">
                    <div className="rounded-lg bg-amber-500/10 p-2.5">
                      <MapPin className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p className="font-medium whitespace-pre-line">{vendor.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Categories Section */}
              {vendor.categories && vendor.categories.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Categories & Specializations</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {vendor.categories.map((cat) => (
                        <Badge 
                          key={cat} 
                          variant="outline"
                          className="px-4 py-2 text-sm font-medium bg-muted/10"
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RFPs Tab */}
        <TabsContent value="rfps" className="space-y-6 mt-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">RFP History</CardTitle>
                  <CardDescription>All RFPs sent to this vendor</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {!vendor.rfpVendors || vendor.rfpVendors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4">
                    <FileText className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="mt-4 font-semibold">No RFPs sent yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                    This vendor hasn&apos;t received any RFPs. Send them an RFP to get started.
                  </p>
                  <Button className="mt-4" size="sm" asChild>
                    <Link href="/rfps">
                      <Send className="mr-2 h-4 w-4" />
                      Browse RFPs
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {vendor.rfpVendors.map((rv: any) => (
                    <Link
                      key={rv.id}
                      href={`/rfps/${rv.rfp?.id}`}
                      className="flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{rv.rfp?.title || 'Untitled RFP'}</p>
                          <p className="text-sm text-muted-foreground">
                            {rv.sentAt
                              ? `Sent ${formatDistanceToNow(new Date(rv.sentAt), { addSuffix: true })}`
                              : 'Pending delivery'}
                          </p>
                        </div>
                      </div>
                      <EmailStatusBadge status={rv.emailStatus} />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Proposals Tab */}
        <TabsContent value="proposals" className="space-y-6 mt-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Proposal History</CardTitle>
                  <CardDescription>All proposals submitted by this vendor</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {!vendor.proposals || vendor.proposals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4">
                    <Mail className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="mt-4 font-semibold">No proposals received</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                    This vendor hasn&apos;t submitted any proposals yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vendor.proposals.map((proposal: any) => (
                    <Link
                      key={proposal.id}
                      href={`/rfps/${proposal.rfp?.id}`}
                      className="block p-4 rounded-xl border-2 border-transparent bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/20 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                            <Mail className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{proposal.rfp?.title || 'Untitled RFP'}</p>
                            <p className="text-sm text-muted-foreground">
                              Received {formatDistanceToNow(new Date(proposal.receivedAt), { addSuffix: true })}
                            </p>
                            {proposal.aiSummary && (
                              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                {proposal.aiSummary}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          {proposal.aiScore && (
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-amber-500" />
                              <span className="text-2xl font-bold text-primary">{proposal.aiScore}</span>
                            </div>
                          )}
                          <ProposalStatusBadge status={proposal.status} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{vendor.name}&quot;? This action
              cannot be undone and will remove all associated data.
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