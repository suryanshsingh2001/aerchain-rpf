import { Suspense } from 'react';
import { getVendors } from '@/lib/actions';
import { VendorsTable } from '@/components/vendors/vendors-table';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

function VendorsTableSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

async function VendorsContent({ page }: { page: number }) {
  const result = await getVendors(page, 20);
  
  if (result.error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Error loading vendors: {result.error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <VendorsTable 
      initialVendors={result.data || []} 
      initialPagination={result.pagination || null} 
    />
  );
}

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Vendors</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">Manage your vendor network</p>
        </div>

        <Suspense fallback={<VendorsTableSkeleton />}>
          <VendorsContent page={page} />
        </Suspense>
      </div>
    </>
  );
}
