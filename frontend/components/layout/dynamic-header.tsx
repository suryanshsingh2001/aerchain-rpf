'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Fragment } from 'react';

// Route segment to display name mapping
const segmentLabels: Record<string, string> = {
  rfps: 'RFPs',
  vendors: 'Vendors',
  create: 'Create',
  edit: 'Edit',
  send: 'Send to Vendors',
  proposals: 'Proposals',
  compare: 'Compare',
};

/**
 * Format ID to a shorter, readable format for breadcrumbs
 */
function formatEntityId(segment: string, parentSegment?: string): string {
  if (!segment || segment.length < 8) return segment;
  const suffix = segment.slice(-8).toUpperCase();
  
  if (parentSegment === 'rfps') {
    return `RFP-${suffix}`;
  }
  if (parentSegment === 'vendors') {
    return `VND-${suffix}`;
  }
  return suffix;
}

function formatSegment(segment: string, parentSegment?: string): string {
  // Check if it's a known segment
  if (segmentLabels[segment]) {
    return segmentLabels[segment];
  }
  
  // Check if it's a UUID or CUID (detail page) - format as entity ID
  if (segment.match(/^[0-9a-f-]{36}$/i) || segment.match(/^[a-z0-9]{20,}$/i)) {
    return formatEntityId(segment, parentSegment);
  }
  
  // Default: capitalize and replace hyphens
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateBreadcrumbs(pathname: string) {
  // Remove leading slash and split
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return []; // Dashboard - no additional breadcrumbs
  }
  
  const breadcrumbs: { label: string; href?: string }[] = [];
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    const parentSegment = index > 0 ? segments[index - 1] : undefined;
    
    breadcrumbs.push({
      label: formatSegment(segment, parentSegment),
      href: isLast ? undefined : currentPath,
    });
  });
  
  return breadcrumbs;
}

export function DynamicHeader() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);
  
  // Determine page title from the last breadcrumb or "Dashboard"
  const pageTitle = breadcrumbs.length > 0 
    ? breadcrumbs[breadcrumbs.length - 1].label 
    : 'Dashboard';

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="ml-1" />
   
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {pathname === '/' ? (
              <BreadcrumbPage className='font-semibold text-lg'>Dashboard</BreadcrumbPage>
            ) : (
              <BreadcrumbLink className='font-semibold ' href="/">Dashboard</BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {breadcrumbs.map((item, index) => (
            <Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink className='font-semibold text-foreground' href={item.href}>{item.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className='font-semibold text-foreground'>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
