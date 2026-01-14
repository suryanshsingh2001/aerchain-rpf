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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Rfp, Vendor } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

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
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function RfpStatusBadge({ status }: { status: Rfp['status'] }) {
  const config = {
    DRAFT: { variant: 'secondary' as const, icon: FileText },
    SENT: { variant: 'default' as const, icon: Mail },
    EVALUATING: { variant: 'outline' as const, icon: Clock },
    CLOSED: { variant: 'secondary' as const, icon: CheckCircle2 },
  };

  const { variant, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className="gap-1">
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

export function DashboardContent({ stats, recentRfps, recentVendors }: DashboardContentProps) {
  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/rfps/create">
            <Plus className="mr-2 h-4 w-4" />
            Create RFP
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/vendors/create">
            <Users className="mr-2 h-4 w-4" />
            Add Vendor
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total RFPs"
          value={stats.totalRfps}
          icon={FileText}
          description="All time"
        />
        <StatCard
          title="Active Vendors"
          value={stats.totalVendors}
          icon={Users}
          description="Ready to receive RFPs"
        />
        <StatCard
          title="Proposals Received"
          value={stats.totalProposals}
          icon={Mail}
          description="Total responses"
        />
        <StatCard
          title="Evaluating"
          value={stats.evaluatingRfps}
          icon={Sparkles}
          description="AI analysis in progress"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent RFPs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent RFPs</CardTitle>
              <CardDescription>Latest procurement requests</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/rfps">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentRfps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No RFPs yet. Create your first one!
                </p>
                <Button className="mt-4" size="sm" asChild>
                  <Link href="/rfps/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create RFP
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRfps.map((rfp) => (
                  <Link
                    key={rfp.id}
                    href={`/rfps/${rfp.id}`}
                    className="flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-accent"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{rfp.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <RfpStatusBadge status={rfp.status} />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(rfp.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                    {rfp._count?.proposals ? (
                      <Badge variant="secondary">
                        {rfp._count.proposals} proposal{rfp._count.proposals !== 1 ? 's' : ''}
                      </Badge>
                    ) : null}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Vendors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Vendors</CardTitle>
              <CardDescription>Your vendor network</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/vendors">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentVendors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No vendors yet. Add your first vendor!
                </p>
                <Button className="mt-4" size="sm" asChild>
                  <Link href="/vendors/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Vendor
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentVendors.map((vendor) => (
                  <Link
                    key={vendor.id}
                    href={`/vendors/${vendor.id}`}
                    className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-accent"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-medium text-primary">
                        {vendor.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{vendor.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {vendor.email}
                      </p>
                    </div>
                    <Badge
                      variant={
                        vendor.status === 'ACTIVE' ? 'default' : 'secondary'
                      }
                    >
                      {vendor.status.toLowerCase()}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    
    </div>
  );
}
