'use client';

import { Sparkles, Trophy, CheckCircle2, DollarSign, Clock, Shield } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { ComparisonResult } from '@/lib/types';

interface AiRecommendationCardProps {
  comparison: ComparisonResult;
}

export function AiRecommendationCard({ comparison }: AiRecommendationCardProps) {
  return (
    <Card className="border-emerald-500/50 bg-gradient-to-br from-emerald-500/5 to-transparent overflow-hidden">
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

interface ScoreIndicatorProps {
  score: number;
}

export function ScoreIndicator({ score }: ScoreIndicatorProps) {
  const getColor = () => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div
      className={`inline-flex items-center justify-center h-12 w-12 rounded-full font-bold ${getColor()}`}
    >
      {score}
    </div>
  );
}

interface ComparisonMetricProps {
  label: string;
  values: any[];
  bestIndex: number;
  icon: React.ComponentType<{ className?: string }>;
  format?: (v: any) => string;
}

export function ComparisonMetric({
  label,
  values,
  bestIndex,
  icon: Icon,
  format = (v: any) => v?.toString() || 'N/A',
}: ComparisonMetricProps) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `200px repeat(${values.length}, 1fr)` }}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {values.map((value, idx) => (
        <div
          key={idx}
          className={`text-center p-2 rounded ${
            idx === bestIndex ? 'bg-green-50 border border-green-200' : ''
          }`}
        >
          <span className={`font-medium ${idx === bestIndex ? 'text-green-700' : ''}`}>
            {format(value)}
          </span>
        </div>
      ))}
    </div>
  );
}
