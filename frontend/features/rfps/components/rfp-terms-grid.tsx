'use client';

import { DollarSign, Calendar, FileText, Shield } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface RfpTermsGridProps {
  budget: string | null;
  currency?: string;
  deliveryDays: number | null;
  paymentTerms: string | null;
  warrantyMonths: number | null;
  variant?: 'default' | 'compact';
}

export function RfpTermsGrid({
  budget,
  currency,
  deliveryDays,
  paymentTerms,
  warrantyMonths,
  variant = 'default',
}: RfpTermsGridProps) {
  const terms = [
    {
      icon: DollarSign,
      label: 'Budget',
      value: formatCurrency(budget, currency),
    },
    {
      icon: Calendar,
      label: 'Delivery',
      value: deliveryDays ? `${deliveryDays} days` : 'Not specified',
    },
    {
      icon: FileText,
      label: 'Payment',
      value: paymentTerms || 'Not specified',
    },
    {
      icon: Shield,
      label: 'Warranty',
      value: warrantyMonths ? `${warrantyMonths} mo` : 'Not specified',
    },
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 gap-3 text-sm">
        {terms.slice(0, 2).map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium">{value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {terms.map(({ icon: Icon, label, value }) => (
        <div key={label} className="rounded-xl border bg-muted/30 p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}
