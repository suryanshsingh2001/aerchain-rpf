import { Rfp, Vendor, Proposal, RfpVendor } from "@prisma/client";

// ============================================
// RFP Types
// ============================================

export interface RfpItem {
  name: string;
  quantity: number;
  specifications?: string;
  unit?: string;
}

export interface ParsedRfpData {
  title: string;
  description?: string;
  items: RfpItem[];
  budget?: number;
  currency?: string;
  deliveryDays?: number;
  deliveryDeadline?: Date;
  paymentTerms?: string;
  warrantyMonths?: number;
  additionalTerms?: string;
}

export interface CreateRfpRequest {
  naturalLanguageInput: string;
}

export interface UpdateRfpRequest {
  title?: string;
  description?: string;
  items?: RfpItem[];
  budget?: number;
  currency?: string;
  deliveryDays?: number;
  deliveryDeadline?: Date;
  paymentTerms?: string;
  warrantyMonths?: number;
  additionalTerms?: string;
  status?: "DRAFT" | "SENT" | "EVALUATING" | "CLOSED";
}

export interface SendRfpRequest {
  vendorIds: string[];
}

// ============================================
// Vendor Types
// ============================================

export interface CreateVendorRequest {
  name: string;
  email: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  categories?: string[];
}

export interface UpdateVendorRequest {
  name?: string;
  email?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  categories?: string[];
  status?: "ACTIVE" | "INACTIVE";
}

// ============================================
// Proposal Types
// ============================================

export interface ProposalItem {
  name: string;
  quotedPrice: number;
  quantity: number;
  notes?: string;
}

export interface ParsedProposalData {
  items: ProposalItem[];
  totalPrice?: number;
  currency?: string;
  deliveryDays?: number;
  warrantyMonths?: number;
  paymentTerms?: string;
  terms?: string;
  conditions?: string;
}

export interface ProposalComparison {
  proposalId: string;
  vendorId: string;
  vendorName: string;
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export interface ComparisonResult {
  rfpId: string;
  proposals: ProposalComparison[];
  recommendation: {
    vendorId: string;
    vendorName: string;
    reasoning: string;
  };
  summary: string;
}

// ============================================
// Email Types
// ============================================

export interface InboundEmailPayload {
  from: string;
  to: string;
  subject: string;
  body: string;
  rawPayload?: unknown;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// ============================================
// Extended Types with Relations
// ============================================

export type RfpWithRelations = Rfp & {
  rfpVendors?: (RfpVendor & { vendor: Vendor })[];
  proposals?: (Proposal & { vendor: Vendor })[];
};

export type ProposalWithRelations = Proposal & {
  vendor: Vendor;
  rfp: Rfp;
};
