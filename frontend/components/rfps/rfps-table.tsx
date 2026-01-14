"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Clock,
  CheckCircle2,
  Trash2,
  Eye,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Rfp, RfpStatus, Pagination } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { deleteRfp as deleteRfpAction } from "@/lib/actions";
import { useRouter } from "next/navigation";

function RfpStatusBadge({ status }: { status: RfpStatus }) {
  const config: Record<
    RfpStatus,
    {
      variant: "default" | "secondary" | "outline" | "destructive";
      icon: typeof FileText;
    }
  > = {
    DRAFT: { variant: "secondary", icon: FileText },
    SENT: { variant: "default", icon: Mail },
    EVALUATING: { variant: "outline", icon: Clock },
    CLOSED: { variant: "secondary", icon: CheckCircle2 },
  };

  const { variant, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

interface RfpsTableProps {
  initialRfps: Rfp[];
  initialPagination: Pagination | null;
}

export function RfpsTable({ initialRfps, initialPagination }: RfpsTableProps) {
  const router = useRouter();
  const [rfps, setRfps] = useState(initialRfps);
  const [pagination, setPagination] = useState(initialPagination);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rfpToDelete, setRfpToDelete] = useState<Rfp | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!rfpToDelete) return;

    startTransition(async () => {
      const result = await deleteRfpAction(rfpToDelete.id);
      if (result.error) {
        toast.error("Failed to delete RFP");
      } else {
        toast.success("RFP deleted successfully");
        setRfps(rfps.filter((r) => r.id !== rfpToDelete.id));
        router.refresh();
      }
      setDeleteDialogOpen(false);
      setRfpToDelete(null);
    });
  };

  const filteredRfps = rfps.filter((rfp) => {
    const matchesSearch = rfp.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || rfp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (
    value: string | null | undefined,
    currency = "USD"
  ) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

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
      <div className="rounded-md border">
        {filteredRfps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No RFPs found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first RFP using natural language"}
            </p>
            {!search && statusFilter === "all" && (
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
              <TableRow>
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Vendors</TableHead>
                <TableHead>Proposals</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRfps.map((rfp, index) => (
                <TableRow key={rfp.id}>
                  <TableCell className="text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/rfps/${rfp.id}`}
                      className="font-medium hover:underline"
                    >
                      {rfp.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <RfpStatusBadge status={rfp.status} />
                  </TableCell>
                  <TableCell>
                    {formatCurrency(rfp.budget, rfp.currency)}
                  </TableCell>
                  <TableCell>{rfp.rfpVendors?.length || 0}</TableCell>
                  <TableCell>{rfp._count?.proposals || 0}</TableCell>
                  <TableCell className="text-muted-foreground">
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
                        {rfp.status === "DRAFT" && (
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
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              asChild
            >
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
              Are you sure you want to delete &quot;{rfpToDelete?.title}&quot;?
              This action cannot be undone and will also delete all associated
              proposals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
