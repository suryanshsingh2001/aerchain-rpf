'use server';

import { api } from '@/lib/api';
import type { Rfp, Vendor, Proposal, ComparisonResult, CreateVendorRequest, UpdateVendorRequest } from '@/lib/types';

// ============================================
// RFP Actions
// ============================================

export async function getRfps(page = 1, limit = 10) {
  try {
    const response = await api.getRfps(page, limit);
    return { data: response.data, pagination: response.pagination, error: null };
  } catch (error) {
    return { data: null, pagination: null, error: (error as Error).message };
  }
}

export async function getRfpById(id: string) {
  try {
    const response = await api.getRfpById(id);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function createRfp(naturalLanguageInput: string) {
  try {
    const response = await api.createRfp(naturalLanguageInput);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function updateRfp(id: string, data: Partial<Rfp>) {
  try {
    const response = await api.updateRfp(id, data);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function deleteRfp(id: string) {
  try {
    const response = await api.deleteRfp(id);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function sendRfp(id: string, vendorIds: string[]) {
  try {
    const response = await api.sendRfp(id, vendorIds);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function getProposalsByRfp(rfpId: string) {
  try {
    const response = await api.getProposalsByRfp(rfpId);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function compareProposals(rfpId: string) {
  try {
    const response = await api.compareProposals(rfpId);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

// ============================================
// Vendor Actions
// ============================================

export async function getVendors(
  page = 1,
  limit = 10,
  search?: string,
  status?: 'ACTIVE' | 'INACTIVE'
) {
  try {
    const response = await api.getVendors(page, limit, search, status);
    return { data: response.data, pagination: response.pagination, error: null };
  } catch (error) {
    return { data: null, pagination: null, error: (error as Error).message };
  }
}

export async function getVendorById(id: string) {
  try {
    const response = await api.getVendorById(id);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function createVendor(data: CreateVendorRequest) {
  try {
    const response = await api.createVendor(data);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function updateVendor(id: string, data: UpdateVendorRequest) {
  try {
    const response = await api.updateVendor(id, data);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function deleteVendor(id: string) {
  try {
    const response = await api.deleteVendor(id);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

// ============================================
// Proposal Actions
// ============================================

export async function getProposalById(id: string) {
  try {
    const response = await api.getProposalById(id);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function createProposal(data: {
  rfpId: string;
  vendorId: string;
  rawContent: string;
  rawSubject?: string;
}) {
  try {
    const response = await api.createProposal(data);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}
