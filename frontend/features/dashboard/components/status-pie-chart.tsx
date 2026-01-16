'use client';

import Link from 'next/link';
import { FileText, Plus, PieChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface StatusPieChartProps {
  data: Array<{ name: string; value: number; fill: string }>;
}

const chartConfig: ChartConfig = {
  draft: { label: 'Draft', color: '#64748b' },
  sent: { label: 'Sent', color: '#10b981' },
  evaluating: { label: 'Evaluating', color: '#f59e0b' },
  closed: { label: 'Closed', color: '#3b82f6' },
};

export function StatusPieChart({ data }: StatusPieChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <PieChart className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">RFP Status Overview</CardTitle>
        </div>
        <CardDescription>Current distribution of all RFPs</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-50 text-center">
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
          <ChartContainer config={chartConfig} className="h-50 w-full">
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </RechartsPieChart>
          </ChartContainer>
        )}
        {data.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {data.map((item) => (
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
  );
}
