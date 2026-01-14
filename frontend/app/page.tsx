import { Suspense } from 'react';
import { getRfps, getVendors } from '@/lib/actions';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

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
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </>
  );
}
