'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScoreIndicator } from './comparison-components';
import type { Proposal } from '@/lib/types';

interface StrengthsWeaknessesGridProps {
  proposals: Proposal[];
}

export function StrengthsWeaknessesGrid({ proposals }: StrengthsWeaknessesGridProps) {
  const hasAnalysis = proposals.some((p) => p.aiStrengths || p.aiWeaknesses);

  if (!hasAnalysis) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {proposals.map((proposal) => (
        <Card key={proposal.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{proposal.vendor.name}</CardTitle>
              {proposal.aiScore && <ScoreIndicator score={proposal.aiScore} />}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {proposal.aiStrengths && proposal.aiStrengths.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {proposal.aiStrengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {proposal.aiWeaknesses && proposal.aiWeaknesses.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Weaknesses
                </h4>
                <ul className="space-y-1">
                  {proposal.aiWeaknesses.map((weakness, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!proposal.aiStrengths?.length && !proposal.aiWeaknesses?.length && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No AI analysis available yet
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
