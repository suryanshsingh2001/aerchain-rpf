'use client';

import { CheckCircle2, Mail, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SendSuccessCardProps {
  rfpId: string;
  vendorCount: number;
}

export function SendSuccessCard({ rfpId, vendorCount }: SendSuccessCardProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 p-8 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-4 shadow-lg">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">RFP Sent Successfully!</h2>
          <p className="text-muted-foreground">
            Your RFP has been sent to {vendorCount} vendor{vendorCount !== 1 ? 's' : ''}
          </p>
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="rounded-xl bg-muted/50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Emails Sent</p>
                <p className="text-xs text-muted-foreground">
                  Vendors will receive the RFP details via email
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium">AI-Powered Analysis</p>
                <p className="text-xs text-muted-foreground">
                  Proposals will be automatically parsed and scored
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/rfps">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to RFPs
              </Link>
            </Button>
            <Button className="flex-1" asChild>
              <Link href={`/rfps/${rfpId}`}>View RFP Details</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
