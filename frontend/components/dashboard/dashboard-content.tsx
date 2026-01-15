'use client';

import Link from 'next/link';
import {
  FileText,
  Users,
  Mail,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
  Sparkles,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Rfp, Vendor } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  XAxis,
  YAxis,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';

interface DashboardStats {
  totalRfps: number;
  draftRfps: number;
  sentRfps: number;
  evaluatingRfps: number;
  totalVendors: number;
  totalProposals: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold">{value}</div>
          {trend && trendValue && (
            <div className={`flex items-center text-xs font-medium ${
              trend === 'up' ? 'text-emerald-600' : 
              trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-0.5" /> : 
               trend === 'down' ? <TrendingDown className="h-3 w-3 mr-0.5" /> : null}
              {trendValue}
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function RfpStatusBadge({ status }: { status: Rfp['status'] }) {
  const config = {
    DRAFT: { 
      className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', 
      icon: FileText 
    },
    SENT: { 
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800', 
      icon: Mail 
    },
    EVALUATING: { 
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800', 
      icon: Clock 
    },
    CLOSED: { 
      className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800', 
      icon: CheckCircle2 
    },
  };

  const { className, icon: Icon } = config[status];

  return (
    <Badge variant="outline" className={`gap-1 ${className}`}>
      <Icon className="h-3 w-3" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

interface DashboardContentProps {
  stats: DashboardStats;
  recentRfps: Rfp[];
  recentVendors: Vendor[];
}

// Chart configurations
const rfpStatusConfig: ChartConfig = {
  draft: { label: 'Draft', color: '#64748b' },
  sent: { label: 'Sent', color: '#10b981' },
  evaluating: { label: 'Evaluating', color: '#f59e0b' },
  closed: { label: 'Closed', color: '#3b82f6' },
};

const activityConfig: ChartConfig = {
  rfps: { label: 'RFPs', color: '#8b5cf6' },
  proposals: { label: 'Proposals', color: '#06b6d4' },
};

export function DashboardContent({ stats, recentRfps, recentVendors }: DashboardContentProps) {
  // Calculate RFP status distribution for pie chart
  const statusData = [
    { name: 'Draft', value: stats.draftRfps, fill: '#64748b' },
    { name: 'Sent', value: stats.sentRfps, fill: '#10b981' },
    { name: 'Evaluating', value: stats.evaluatingRfps, fill: '#f59e0b' },
    { name: 'Closed', value: Math.max(0, stats.totalRfps - stats.draftRfps - stats.sentRfps - stats.evaluatingRfps), fill: '#3b82f6' },
  ].filter(item => item.value > 0);

  // Generate activity data from real RFPs - group by month
  const activityData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const last6Months: { month: string; rfps: number; proposals: number }[] = [];
    
    // Create data for last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      last6Months.push({ month: monthName, rfps: 0, proposals: 0 });
    }
    
    // Count RFPs per month from real data
    recentRfps.forEach(rfp => {
      const rfpDate = new Date(rfp.createdAt);
      const rfpMonth = months[rfpDate.getMonth()];
      const monthData = last6Months.find(m => m.month === rfpMonth);
      if (monthData) {
        monthData.rfps += 1;
        monthData.proposals += rfp._count?.proposals || 0;
      }
    });
    
    return last6Months;
  })();

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
        {/* RFP Status Distribution - Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">RFP Status Overview</CardTitle>
            </div>
            <CardDescription>Current distribution of all RFPs</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <FileText className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No RFPs yet</p>
                <Button className="mt-3" size="sm" asChild>
                  <Link href="/rfps/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create RFP
                  </Link>
                </Button>
              </div>
            ) : (
              <ChartContainer config={rfpStatusConfig} className="h-[200px] w-full">
                <RechartsPieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RechartsPieChart>
              </ChartContainer>
            )}
            {statusData.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Over Time - Area Chart */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Procurement Activity</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/rfps">
                  View Details
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <CardDescription>RFPs created and proposals received over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={activityConfig} className="h-[200px] w-full">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="fillRfps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillProposals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="rfps"
                  stroke="#8b5cf6"
                  fill="url(#fillRfps)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="proposals"
                  stroke="#06b6d4"
                  fill="url(#fillProposals)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-violet-500" />
                <span className="text-sm text-muted-foreground">RFPs Created</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-cyan-500" />
                <span className="text-sm text-muted-foreground">Proposals Received</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
