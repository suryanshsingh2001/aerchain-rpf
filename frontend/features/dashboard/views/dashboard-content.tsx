'use client';

import { FileText, Users, Mail, Sparkles } from 'lucide-react';
import type { Rfp, Vendor } from '@/lib/types';
import { StatCard, StatusPieChart, ActivityChart } from '../components';
import { 
  calculateStatusData, 
  calculateActivityData, 
  type DashboardStats 
} from '../utils';

interface DashboardContentProps {
  stats: DashboardStats;
  recentRfps: Rfp[];
  recentVendors: Vendor[];
}

export function DashboardContent({ stats, recentRfps }: DashboardContentProps) {
  const statusData = calculateStatusData(stats);
  const activityData = calculateActivityData(recentRfps);

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total RFPs"
          value={stats.totalRfps}
          icon={FileText}
          description="All time requests"
        />
        <StatCard
          title="Active Vendors"
          value={stats.totalVendors}
          icon={Users}
          description="In your network"
        />
        <StatCard
          title="Proposals Received"
          value={stats.totalProposals}
          icon={Mail}
          description="Total responses"
        />
        <StatCard
          title="Pending Evaluation"
          value={stats.evaluatingRfps}
          icon={Sparkles}
          description="AI analysis ready"
          trend={stats.evaluatingRfps > 0 ? 'up' : 'neutral'}
          trendValue={stats.evaluatingRfps > 0 ? 'Action needed' : 'All clear'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatusPieChart data={statusData} />
        <ActivityChart data={activityData} />
      </div>
    </div>
  );
}
