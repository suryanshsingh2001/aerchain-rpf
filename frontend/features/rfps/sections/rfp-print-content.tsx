'use client';

import { RfpStatusBadge, formatCurrency } from '@/features/rfps';
import { format } from 'date-fns';
import type { Rfp, RfpItem } from '@/lib/types';

interface RfpPrintContentProps {
  rfp: Rfp;
}

export function RfpPrintContent({ rfp }: RfpPrintContentProps) {
  const items = rfp.items as RfpItem[];
  const vendors = rfp.rfpVendors || [];

  return (
    <>
      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block print:mb-8">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">{rfp.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Created {format(new Date(rfp.createdAt), 'PPP')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Request for Proposal</p>
            <RfpStatusBadge status={rfp.status} />
          </div>
        </div>
      </div>

      {/* Print-only content - Full RFP for PDF export */}
      <div className="hidden print:block print:space-y-6">
        {/* Description */}
        {rfp.description && (
          <div className="mb-4">
            <p className="text-muted-foreground">{rfp.description}</p>
          </div>
        )}

        {/* Items */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Items Required</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">#</th>
                <th className="text-left py-2 font-medium">Item</th>
                <th className="text-left py-2 font-medium">Specifications</th>
                <th className="text-right py-2 font-medium">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2 font-medium">{item.name}</td>
                  <td className="py-2 text-muted-foreground">{item.specifications || '-'}</td>
                  <td className="py-2 text-right">
                    {item.quantity} {item.unit || ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Terms */}
        <div className="grid grid-cols-4 gap-4 border rounded-lg p-4 mt-6">
          <div>
            <p className="text-sm text-muted-foreground">Budget</p>
            <p className="font-semibold">{formatCurrency(rfp.budget, rfp.currency)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Delivery</p>
            <p className="font-semibold">
              {rfp.deliveryDays ? `${rfp.deliveryDays} days` : 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payment Terms</p>
            <p className="font-semibold">{rfp.paymentTerms || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Warranty</p>
            <p className="font-semibold">
              {rfp.warrantyMonths ? `${rfp.warrantyMonths} months` : 'Not specified'}
            </p>
          </div>
        </div>

        {/* Additional Terms */}
        {rfp.additionalTerms && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Additional Terms</h3>
            <p className="text-muted-foreground">{rfp.additionalTerms}</p>
          </div>
        )}

        {/* Vendors */}
        {vendors.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-3">Selected Vendors</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Vendor</th>
                  <th className="text-left py-2 font-medium">Email</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((rv) => (
                  <tr key={rv.id} className="border-b">
                    <td className="py-2 font-medium">{rv.vendor.name}</td>
                    <td className="py-2">{rv.vendor.email}</td>
                    <td className="py-2">{rv.emailStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-sm text-muted-foreground text-center">
          Generated on {format(new Date(), 'PPP')} • RFP ID: {rfp.id}
        </div>
      </div>
    </>
  );
}
