'use client';

import {
  Package,
  DollarSign,
  Calendar,
  FileText,
  Shield,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '../utils';
import type { Rfp, RfpItem } from '@/lib/types';

interface RfpDetailsTabProps {
  rfp: Rfp;
}

export function RfpDetailsTab({ rfp }: RfpDetailsTabProps) {
  const items = rfp.items as RfpItem[];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">RFP Overview</CardTitle>
              <CardDescription>Requirements and specifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {rfp.description && (
            <p className="text-muted-foreground">{rfp.description}</p>
          )}

          {/* Items */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Items Required
            </h4>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 rounded-xl border bg-linear-to-r from-muted/50 to-transparent hover:from-muted/80 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.specifications && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.specifications}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-background font-medium">
                    {item.quantity} {item.unit || 'units'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Terms Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Budget</span>
              </div>
              <p className="text-lg font-semibold">
                {formatCurrency(rfp.budget, rfp.currency)}
              </p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Delivery</span>
              </div>
              <p className="text-lg font-semibold">
                {rfp.deliveryDays ? `${rfp.deliveryDays} days` : 'Not specified'}
              </p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Payment</span>
              </div>
              <p className="text-lg font-semibold">
                {rfp.paymentTerms || 'Not specified'}
              </p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Warranty</span>
              </div>
              <p className="text-lg font-semibold">
                {rfp.warrantyMonths ? `${rfp.warrantyMonths} mo` : 'Not specified'}
              </p>
            </div>
          </div>

          {rfp.additionalTerms && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Additional Terms</h4>
                <p className="text-sm text-muted-foreground">{rfp.additionalTerms}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Original Input */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-violet-500/10 p-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Original Request</CardTitle>
              <CardDescription>
                Natural language input used to generate this RFP
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-xl bg-muted/50 p-5 border-l-4 border-violet-500">
            <p className="text-sm leading-relaxed italic text-muted-foreground">
              &quot;{rfp.originalInput}&quot;
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
