'use client';

import { Trophy, CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ComparisonResult } from '@/lib/types';

interface AiRecommendationCardProps {
  comparison: ComparisonResult;
}

export function AiRecommendationCard({ comparison }: AiRecommendationCardProps) {
  return (
    <Card className="border-emerald-500/50 bg-linear-to-br from-emerald-500/5 to-transparent overflow-hidden pt-0">
      <CardHeader className="border-b border-emerald-500/20">
        <CardTitle className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-2">
            <Trophy className="h-5 w-5 text-emerald-500" />
          </div>
          AI Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-xl">{comparison.recommendation.vendorName}</p>
            <p className="text-muted-foreground text-sm">Recommended Vendor</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed">{comparison.recommendation.reasoning}</p>
        <Separator />
        <p className="text-sm text-muted-foreground">{comparison.summary}</p>
      </CardContent>
    </Card>
  );
}
