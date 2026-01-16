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
  ArrowLeft,
  X,
  UserPlus,
  CheckCircle2,
  Package,
  Calendar,
  Sparkles,
  DollarSign
} from 'lucide-react';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRfp, useRfps } from '@/hooks/use-rfps';
import { useVendors } from '@/hooks/use-vendors';
import { RfpSummaryCard, SendSuccessCard, formatCurrency, getStatusColor } from '@/features/rfps';
import { NotFoundState } from '@/features/shared';
import type { Vendor, RfpItem } from '@/lib/types';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

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

  const formatCurrency = (value: string | null | undefined, currency = 'USD') => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
      case 'CLOSED': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
      case 'DRAFT': return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
      default: return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
    }
  };

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
            <Skeleton className="h-[500px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!rfp) {
    return <NotFoundState entity="RFP" backHref="/rfps" backLabel="Back to RFPs" />;
  }

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 p-8 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-4 shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">RFP Sent Successfully!</h2>
            <p className="text-muted-foreground">
              Your RFP has been sent to {selectedVendors.size} vendor{selectedVendors.size !== 1 ? 's' : ''}
            </p>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="rounded-xl bg-muted/50 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Emails Sent</p>
                  <p className="text-xs text-muted-foreground">Vendors will receive the RFP details via email</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">AI-Powered Analysis</p>
                  <p className="text-xs text-muted-foreground">Proposals will be automatically parsed and scored</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/rfps">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to RFPs
                </Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href={`/rfps/${rfpId}`}>
                  View RFP Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
            <p className="text-sm text-muted-foreground">Select vendors to receive this RFP</p>
          </div>
        </div>
        <Badge variant="outline" className={getStatusColor(rfp.status)}>
          {rfp.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - RFP Details */}
        <div className="space-y-4">
          {/* RFP Summary Card */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                RFP Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold line-clamp-2">{rfp.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                  {rfp.description || rfp.originalInput}
                </p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="font-medium">{formatCurrency(rfp.budget, rfp.currency)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery</p>
                    <p className="font-medium">{rfp.deliveryDays ? `${rfp.deliveryDays} days` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs text-muted-foreground mb-2">Items ({(rfp.items as RfpItem[]).length})</p>
                <div className="space-y-1.5">
                  {(rfp.items as RfpItem[]).slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
                      <span className="truncate flex-1">{item.name}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">{item.quantity}</Badge>
                    </div>
                  ))}
                  {(rfp.items as RfpItem[]).length > 3 && (
                    <p className="text-xs text-muted-foreground text-center py-1">
                      +{(rfp.items as RfpItem[]).length - 3} more items
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Vendors Preview */}
          {selectedVendors.size > 0 && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Selected Vendors
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedVendors).slice(0, 4).map((vendorId) => {
                    const vendor = vendors.find(v => v.id === vendorId);
                    if (!vendor) return null;
                    return (
                      <Badge 
                        key={vendorId} 
                        variant="outline"
                        className="bg-background gap-1 pr-1"
                      >
                        {vendor.name}
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleVendor(vendorId); }}
                          className="ml-1 hover:bg-muted rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                  {selectedVendors.size > 4 && (
                    <Badge variant="secondary">+{selectedVendors.size - 4} more</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Vendor Selection */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Select Vendors</CardTitle>
                    <CardDescription>Choose vendors to receive this RFP</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={selectedVendors.size > 0 ? "default" : "secondary"}
                    className="h-7 px-3"
                  >
                    {selectedVendors.size} of {filteredVendors.length}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Search and Actions */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAll}
                  disabled={filteredVendors.length === 0}
                  className="whitespace-nowrap"
                >
                  {selectedVendors.size === filteredVendors.length && filteredVendors.length > 0
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              </div>

              {/* Vendor List */}
              {filteredVendors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4">
                    <Users className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="mt-4 font-medium">
                    {vendors.length === 0 ? 'No vendors yet' : 'No vendors found'}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                    {vendors.length === 0
                      ? 'Add vendors to your network to send RFPs'
                      : 'Try adjusting your search term'}
                  </p>
                  {vendors.length === 0 && (
                    <Button className="mt-4" size="sm" asChild>
                      <Link href="/vendors/create">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Vendor
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {filteredVendors.map((vendor) => {
                    const isSelected = selectedVendors.has(vendor.id);
                    return (
                      <div
                        key={vendor.id}
                        className={`group flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary/5 border-primary shadow-sm'
                            : 'border-transparent bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/20'
                        }`}
                        onClick={() => toggleVendor(vendor.id)}
                      >
                        <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors ${
                          isSelected 
                            ? 'bg-primary border-primary' 
                            : 'border-muted-foreground/30 group-hover:border-primary/50'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                          isSelected 
                            ? 'bg-primary/20' 
                            : 'bg-muted group-hover:bg-primary/10'
                        }`}>
                          <span className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>
                            {vendor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{vendor.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{vendor.email}</span>
                          </div>
                        </div>
                        {vendor.categories && vendor.categories.length > 0 && (
                          <div className="hidden sm:flex flex-wrap gap-1 justify-end max-w-[150px]">
                            {vendor.categories.slice(0, 2).map((cat) => (
                              <Badge 
                                key={cat} 
                                variant="outline" 
                                className="text-xs bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300"
                              >
                                {cat}
                              </Badge>
                            ))}
                            {vendor.categories.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{vendor.categories.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Send Button - Sticky at bottom */}
          <div className="sticky bottom-4 mt-4 bg-background/80 backdrop-blur-sm rounded-xl border p-4 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {selectedVendors.size > 0 ? (
                  <>
                    <div className="flex -space-x-2">
                      {Array.from(selectedVendors).slice(0, 3).map((vendorId, idx) => {
                        const vendor = vendors.find(v => v.id === vendorId);
                        return (
                          <div 
                            key={vendorId}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium border-2 border-background"
                          >
                            {vendor?.name.charAt(0).toUpperCase() || '?'}
                          </div>
                        );
                      })}
                      {selectedVendors.size > 3 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium border-2 border-background">
                          +{selectedVendors.size - 3}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedVendors.size} vendor{selectedVendors.size !== 1 ? 's' : ''} selected</p>
                      <p className="text-xs text-muted-foreground">Ready to send</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Select vendors to continue</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" asChild>
                  <Link href={`/rfps/${rfpId}`}>Cancel</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={sending || selectedVendors.size === 0}
                      size="lg"
                      className="gap-2 px-6"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send RFP
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will send the RFP to {selectedVendors.size} selected vendor{selectedVendors.size !== 1 ? 's' : ''}. 
                        Each vendor will receive an email notification inviting them to submit a proposal.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSend}>
                        Confirm Send
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}