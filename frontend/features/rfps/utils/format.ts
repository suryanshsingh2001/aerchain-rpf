/**
 * Format currency values
 */
export function formatCurrency(
  value: string | null | undefined,
  currency = 'USD'
): string {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(parseFloat(value));
}

/**
 * Format ID to a shorter, readable format
 * e.g., "Cmkgsc7or0000zo0iktax7qoe" => "RFP-KTAX7QOE"
 */
export function formatRfpId(id: string): string {
  if (!id || id.length < 8) return id;
  const suffix = id.slice(-8).toUpperCase();
  return `RFP-${suffix}`;
}

/**
 * Format Vendor ID to a shorter, readable format
 */
export function formatVendorId(id: string): string {
  if (!id || id.length < 8) return id;
  const suffix = id.slice(-8).toUpperCase();
  return `VND-${suffix}`;
}

/**
 * Get status color class for various status types
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'SENT':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
    case 'CLOSED':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
    case 'DRAFT':
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
    case 'EVALUATING':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
  }
}
