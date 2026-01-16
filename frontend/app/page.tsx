import { Suspense } from 'react';
import { getRfps, getVendors } from '@/lib/actions';
import { DashboardContent, DashboardSkeleton } from '@/features/dashboard';

async function DashboardData() {
  const [rfpsResult, vendorsResult] = await Promise.all([
    getRfps(1, 100),
    getVendors(1, 5),
  ]);

  const allRfps = rfpsResult.data || [];
  const recentRfps = allRfps.slice(0, 5);
  const recentVendors = vendorsResult.data || [];

  const stats = {
    totalRfps: rfpsResult.pagination?.total || allRfps.length,
    draftRfps: allRfps.filter((r) => r.status === 'DRAFT').length,
    sentRfps: allRfps.filter((r) => r.status === 'SENT').length,
    evaluatingRfps: allRfps.filter((r) => r.status === 'EVALUATING').length,
    totalVendors: vendorsResult.pagination?.total || recentVendors.length,
    totalProposals: allRfps.reduce((acc, r) => acc + (r._count?.proposals || 0), 0),
  };

  return (
    <DashboardContent 
      stats={stats} 
      recentRfps={recentRfps} 
      recentVendors={recentVendors} 
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}
