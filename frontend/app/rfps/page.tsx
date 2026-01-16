import { Suspense } from 'react';
import { getRfps } from '@/lib/actions';
import { RfpsTable, RfpsTableSkeleton } from '@/features/rfps';



async function RfpsContent({ page }: { page: number }) {
  const result = await getRfps(page, 10);
  
  if (result.error) {
    return (
      <div className="rounded-md border p-6">
        <p className="text-destructive">Error loading RFPs: {result.error}</p>
      </div>
    );
  }

  return (
    <RfpsTable 
      initialRfps={result.data || []} 
      initialPagination={result.pagination || null} 
    />
  );
}

export default async function RfpsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">RFPs</h1>
        <p className="text-muted-foreground">Manage your requests for proposals</p>
      </div>

      <Suspense fallback={<RfpsTableSkeleton />}>
        <RfpsContent page={page} />
      </Suspense>
    </div>
  );
}
