'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Trash2,
  Eye,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import type { Rfp, Pagination } from '@/lib/types';
import { deleteRfp as deleteRfpAction } from '@/lib/actions';
import { RfpStatusBadge } from './rfp-status-badge';
import { formatCurrency } from '../utils/format';

interface RfpsTableProps {
  initialRfps: Rfp[];
  initialPagination: Pagination | null;
}

export function RfpsTable({ initialRfps, initialPagination }: RfpsTableProps) {
  const router = useRouter();
  const [rfps, setRfps] = useState(initialRfps);
  const [pagination, setPagination] = useState(initialPagination);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rfpToDelete, setRfpToDelete] = useState<Rfp | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!rfpToDelete) return;

    startTransition(async () => {
      const result = await deleteRfpAction(rfpToDelete.id);
      if (result.error) {
        toast.error('Failed to delete RFP');
      } else {
        toast.success('RFP deleted successfully');
        setRfps(rfps.filter((r) => r.id !== rfpToDelete.id));
        router.refresh();
      }
      setDeleteDialogOpen(false);
      setRfpToDelete(null);
    });
  };

  const filteredRfps = rfps.filter((rfp) => {
    const matchesSearch = rfp.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rfp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search RFPs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="EVALUATING">Evaluating</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/rfps/create">
            <Plus className="h-4 w-4" />
            Create
          </Link>
        </Button>
      </div>

      {/* RFPs Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {filteredRfps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No RFPs found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first RFP using natural language'}
            </p>
            {!search && statusFilter === 'all' && (
              <Button className="mt-4" asChild>
                <Link href="/rfps/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create RFP
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[60px] font-semibold">#</TableHead>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Budget</TableHead>
                <TableHead className="font-semibold text-center">Vendors</TableHead>
                <TableHead className="font-semibold text-center">Proposals</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRfps.map((rfp, index) => (
                <TableRow key={rfp.id} className="group">
                  <TableCell className="text-muted-foreground font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <Link
                        href={`/rfps/${rfp.id}`}
                        className="font-medium hover:text-primary hover:underline transition-colors"
                      >
                        {rfp.title}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RfpStatusBadge status={rfp.status} />
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(rfp.budget, rfp.currency)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-medium">
                      {rfp.rfpVendors?.length || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={`font-medium ${
                        (rfp._count?.proposals || 0) > 0
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : ''
                      }`}
                    >
                      {rfp._count?.proposals || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(rfp.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/rfps/${rfp.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {rfp.status === 'DRAFT' && (
                          <DropdownMenuItem asChild>
                            <Link href={`/rfps/${rfp.id}/send`}>
                              <Send className="mr-2 h-4 w-4" />
                              Send to Vendors
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setRfpToDelete(rfp);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page === 1} asChild>
              <Link href={`/rfps?page=${pagination.page - 1}`}>Previous</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              asChild
            >
              <Link href={`/rfps?page=${pagination.page + 1}`}>Next</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete RFP</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{rfpToDelete?.title}&quot;? This action
              cannot be undone and will also delete all associated proposals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
