'use client';

import { Mail, Users, Building2, Phone, MapPin, Tag } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Vendor } from '@/lib/types';

interface VendorDetailsTabProps {
  vendor: Vendor;
}

export function VendorDetailsTab({ vendor }: VendorDetailsTabProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Contact Information</CardTitle>
            <CardDescription>Vendor contact details and location</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex items-start gap-4 p-4 rounded-xl">
            <div className="rounded-lg bg-blue-500/10 p-2.5">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email Address</p>
              <a
                href={`mailto:${vendor.email}`}
                className="text-primary hover:underline font-medium"
              >
                {vendor.email}
              </a>
            </div>
          </div>

          {vendor.phone && (
            <div className="flex items-start gap-4 p-4 rounded-xl">
              <div className="rounded-lg bg-emerald-500/10 p-2.5">
                <Phone className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                <a href={`tel:${vendor.phone}`} className="font-medium hover:underline">
                  {vendor.phone}
                </a>
              </div>
            </div>
          )}

          {vendor.contactPerson && (
            <div className="flex items-start gap-4 p-4 rounded-xl">
              <div className="rounded-lg bg-violet-500/10 p-2.5">
                <Users className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                <p className="font-medium">{vendor.contactPerson}</p>
              </div>
            </div>
          )}

          {vendor.address && (
            <div className="flex items-start gap-4 p-4 rounded-xl">
              <div className="rounded-lg bg-amber-500/10 p-2.5">
                <MapPin className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="font-medium whitespace-pre-line">{vendor.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Categories Section */}
        {vendor.categories && vendor.categories.length > 0 && (
          <>
            <Separator className="my-6" />
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Categories & Specializations
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {vendor.categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant="outline"
                    className="px-4 py-2 text-sm font-medium bg-muted/10"
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
