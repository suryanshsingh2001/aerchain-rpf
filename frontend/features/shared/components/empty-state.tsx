'use client';

import Link from 'next/link';
import { LucideIcon, FileX, Users, FileText, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  /** Icon to display */
  icon?: LucideIcon;
  /** Preset type for common empty states */
  type?: 'rfps' | 'vendors' | 'proposals' | 'items' | 'custom';
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Compact mode for inline use */
  compact?: boolean;
}

interface ActionConfig {
  label: string;
  href?: string;
  onClick?: () => void;
}

const presets: Record<string, {
  icon: LucideIcon;
  title: string;
  description: string;
  action: ActionConfig | undefined;
}> = {
  rfps: {
    icon: FileText,
    title: 'No RFPs yet',
    description: 'Create your first RFP to start the procurement process.',
    action: { label: 'Create RFP', href: '/rfps/create' },
  },
  vendors: {
    icon: Users,
    title: 'No vendors yet',
    description: 'Add vendors to your network to send them RFPs.',
    action: { label: 'Add Vendor', href: '/vendors/create' },
  },
  proposals: {
    icon: FileX,
    title: 'No proposals yet',
    description: 'Proposals from vendors will appear here once received.',
    action: undefined,
  },
  items: {
    icon: Package,
    title: 'No items',
    description: 'No items have been added yet.',
    action: undefined,
  },
  custom: {
    icon: FileX,
    title: 'Nothing here',
    description: 'No data available.',
    action: undefined,
  },
};

export function EmptyState({
  icon,
  type = 'custom',
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  const preset = presets[type];
  const Icon = icon || preset.icon;
  const displayTitle = title || preset.title;
  const displayDescription = description || preset.description;
  const displayAction = action || preset.action;

  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-medium text-sm">{displayTitle}</p>
        <p className="text-xs text-muted-foreground mt-1">{displayDescription}</p>
        {displayAction && (
          <Button size="sm" className="mt-3" asChild={!!displayAction.href}>
            {displayAction.href ? (
              <Link href={displayAction.href}>{displayAction.label}</Link>
            ) : (
              <span onClick={displayAction.onClick}>{displayAction.label}</span>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">{displayTitle}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{displayDescription}</p>
        {displayAction && (
          <Button className="mt-4" asChild={!!displayAction.href}>
            {displayAction.href ? (
              <Link href={displayAction.href}>{displayAction.label}</Link>
            ) : (
              <span onClick={displayAction.onClick}>{displayAction.label}</span>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
