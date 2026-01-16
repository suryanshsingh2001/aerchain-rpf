import { Suspense } from 'react';
import { getVendors } from '@/lib/actions';
import { VendorsTable, VendorsTableSkeleton } from '@/features/vendors';


async function VendorsContent({ page }: { page: number }) {
  const result = await getVendors(page, 20);
  
  if (result.error) {
    return (
      <div className="rounded-md border p-6">
        <p className="text-destructive">Error loading vendors: {result.error}</p>
      </div>
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
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vendors</h1>
        <p className="text-muted-foreground">Manage your vendor network</p>
      </div>

      <Suspense fallback={<VendorsTableSkeleton />}>
        <VendorsContent page={page} />
      </Suspense>
    </div>
  );
}
