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
  Calendar,
  CheckCircle2,
  Clock,
  Users,
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
      <div className="flex flex-col h-full">
        <Header title="Vendor Details" />
        <div className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Vendor Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Users className="h-16 w-16 text-muted-foreground/50 mx-auto" />
            <h2 className="mt-4 text-lg font-semibold">Vendor not found</h2>
            <p className="mt-2 text-muted-foreground">
              The vendor you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/vendors">Back to Vendors</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title={vendor.name}
        breadcrumbs={[
          { label: 'Vendors', href: '/vendors' },
          { label: vendor.name },
        ]}
      />

      <div className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Actions */}
        <div className="flex items-center justify-end">
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/vendors/${vendorId}/edit`}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
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

        {/* Vendor Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-medium text-primary">
                    {vendor.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-xl">{vendor.name}</CardTitle>
                  <CardDescription className="mt-1">
                    Added {format(new Date(vendor.createdAt), 'PPP')}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={vendor.status === 'ACTIVE' ? 'default' : 'secondary'}
                className="text-sm"
              >
                {vendor.status.toLowerCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contact Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${vendor.email}`}
                    className="text-primary hover:underline"
                  >
                    {vendor.email}
                  </a>
                </div>
              </div>
              {vendor.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <a
                      href={`tel:${vendor.phone}`}
                      className="hover:underline"
                    >
                      {vendor.phone}
                    </a>
                  </div>
                </div>
              )}
              {vendor.contactPerson && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                    <p>{vendor.contactPerson}</p>
                  </div>
                </div>
              )}
              {vendor.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="whitespace-pre-line">{vendor.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Categories */}
            {vendor.categories && vendor.categories.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Categories / Specializations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {vendor.categories.map((cat) => (
                      <Badge key={cat} variant="secondary">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* RFP History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent RFPs</CardTitle>
            <CardDescription>
              RFPs sent to this vendor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!vendor.rfpVendors || vendor.rfpVendors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No RFPs sent to this vendor yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {vendor.rfpVendors.map((rv: any) => (
                  <Link
                    key={rv.id}
                    href={`/rfps/${rv.rfp?.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{rv.rfp?.title || 'Untitled RFP'}</p>
                        <p className="text-sm text-muted-foreground">
                          {rv.sentAt
                            ? `Sent ${formatDistanceToNow(new Date(rv.sentAt), { addSuffix: true })}`
                            : 'Pending'}
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
                      {rv.emailStatus === 'SENT' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {rv.emailStatus === 'PENDING' && <Clock className="mr-1 h-3 w-3" />}
                      {rv.emailStatus}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proposals History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proposals</CardTitle>
            <CardDescription>
              Proposals submitted by this vendor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!vendor.proposals || vendor.proposals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Mail className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No proposals received from this vendor
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {vendor.proposals.map((proposal: any) => (
                  <Link
                    key={proposal.id}
                    href={`/rfps/${proposal.rfp?.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-green-500/10">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{proposal.rfp?.title || 'Untitled RFP'}</p>
                        <p className="text-sm text-muted-foreground">
                          Received {formatDistanceToNow(new Date(proposal.receivedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {proposal.aiScore && (
                        <div className="text-lg font-bold text-primary">{proposal.aiScore}</div>
                      )}
                      <Badge variant="outline">{proposal.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{vendor.name}&quot;? This action
              cannot be undone.
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
