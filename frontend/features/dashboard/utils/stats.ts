import type { Rfp } from '@/lib/types';

export interface DashboardStats {
  totalRfps: number;
  draftRfps: number;
  sentRfps: number;
  evaluatingRfps: number;
  totalVendors: number;
  totalProposals: number;
}

export interface StatusChartData {
  name: string;
  value: number;
  fill: string;
}

export interface ActivityData {
  month: string;
  rfps: number;
  proposals: number;
}

/**
 * Calculate RFP status distribution for pie chart
 */
export function calculateStatusData(stats: DashboardStats): StatusChartData[] {
  return [
    { name: 'Draft', value: stats.draftRfps, fill: '#64748b' },
    { name: 'Sent', value: stats.sentRfps, fill: '#10b981' },
    { name: 'Evaluating', value: stats.evaluatingRfps, fill: '#f59e0b' },
    { name: 'Closed', value: Math.max(0, stats.totalRfps - stats.draftRfps - stats.sentRfps - stats.evaluatingRfps), fill: '#3b82f6' },
  ].filter(item => item.value > 0);
}

/**
 * Generate activity data from RFPs - group by month
 */
export function calculateActivityData(rfps: Rfp[]): ActivityData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  const last6Months: ActivityData[] = [];
  
  // Create data for last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = months[date.getMonth()];
    last6Months.push({ month: monthName, rfps: 0, proposals: 0 });
  }
  
  // Count RFPs per month from real data
  rfps.forEach(rfp => {
    const rfpDate = new Date(rfp.createdAt);
    const rfpMonth = months[rfpDate.getMonth()];
    const monthData = last6Months.find(m => m.month === rfpMonth);
    if (monthData) {
      monthData.rfps += 1;
      monthData.proposals += rfp._count?.proposals || 0;
    }
  });
  
  return last6Months;
}
