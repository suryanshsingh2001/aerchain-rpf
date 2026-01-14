// ============================================
// Enum Types
// ============================================

export type RfpStatus = 'DRAFT' | 'SENT' | 'EVALUATING' | 'CLOSED';
export type VendorStatus = 'ACTIVE' | 'INACTIVE';
export type ProposalStatus = 'RECEIVED' | 'PARSED' | 'EVALUATED';
export type RfpVendorEmailStatus = 'PENDING' | 'SENT' | 'FAILED';

// ============================================
// RFP Types
// ============================================

export interface RfpItem {
  name: string;
  quantity: number;
  specifications?: string;
  unit?: string;
}

export interface Rfp {
  id: string;
  originalInput: string;
  title: string;
  description?: string | null;
  items: RfpItem[];
  budget?: string | null;
  currency: string;
  deliveryDeadline?: string | null;
  deliveryDays?: number | null;
  paymentTerms?: string | null;
  warrantyMonths?: number | null;
  additionalTerms?: string | null;
  status: RfpStatus;
  createdAt: string;
  updatedAt: string;
  rfpVendors?: RfpVendor[];
  proposals?: Proposal[];
  _count?: {
    proposals: number;
  };
}

export interface RfpVendor {
  id: string;
  rfpId: string;
  vendorId: string;
  vendor: Vendor;
  sentAt?: string | null;
  emailStatus: RfpVendorEmailStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Vendor Types
// ============================================

export interface Vendor {
  id: string;
  name: string;
  email: string;
  contactPerson?: string | null;
  phone?: string | null;
  address?: string | null;
  categories: string[];
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
  rfpVendors?: RfpVendor[];
  proposals?: Proposal[];
}

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
  contactPerson?: string | null;
  phone?: string | null;
  address?: string | null;
  categories?: string[];
  status?: VendorStatus;
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

export interface Proposal {
  id: string;
  rfpId: string;
  rfp?: Rfp;
  vendorId: string;
  vendor: Vendor;
  rawContent: string;
  rawSubject?: string | null;
  parsedData?: ParsedProposalData | null;
  totalPrice?: string | null;
  currency: string;
  deliveryDays?: number | null;
  warrantyMonths?: number | null;
  paymentTerms?: string | null;
  aiScore?: number | null;
  aiSummary?: string | null;
  aiStrengths?: string[] | null;
  aiWeaknesses?: string[] | null;
  status: ProposalStatus;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Comparison Types
// ============================================

export interface ProposalComparisonItem {
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
  proposals: ProposalComparisonItem[];
  recommendation: {
    vendorId: string;
    vendorName: string;
    reasoning: string;
  };
  summary: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Alias for convenience
export type Pagination = PaginationMeta;

export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}
