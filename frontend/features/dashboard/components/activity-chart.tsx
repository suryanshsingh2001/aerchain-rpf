'use client';

import Link from 'next/link';
import { BarChart3, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { XAxis, YAxis, Area, AreaChart } from 'recharts';

interface ActivityChartProps {
  data: Array<{ month: string; rfps: number; proposals: number }>;
}

const chartConfig: ChartConfig = {
  rfps: { label: 'RFPs', color: '#8b5cf6' },
  proposals: { label: 'Proposals', color: '#06b6d4' },
};

export function ActivityChart({ data }: ActivityChartProps) {
  return (
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
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={data}>
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
  );
}
