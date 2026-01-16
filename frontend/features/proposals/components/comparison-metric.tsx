'use client';

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
