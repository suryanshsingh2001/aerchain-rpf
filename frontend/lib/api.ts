import type {
  ApiResponse,
  Rfp,
  Vendor,
  Proposal,
  CreateVendorRequest,
  UpdateVendorRequest,
  ComparisonResult,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'An error occurred');
    }

    return data;
  }

  // ============================================
  // RFP Endpoints
  // ============================================

  async getRfps(page = 1, limit = 10): Promise<ApiResponse<Rfp[]>> {
    return this.request<ApiResponse<Rfp[]>>(`/rfps?page=${page}&limit=${limit}`);
  }

  async getRfpById(id: string): Promise<ApiResponse<Rfp>> {
    return this.request<ApiResponse<Rfp>>(`/rfps/${id}`);
  }

  async createRfp(naturalLanguageInput: string): Promise<ApiResponse<Rfp>> {
    return this.request<ApiResponse<Rfp>>('/rfps', {
      method: 'POST',
      body: JSON.stringify({ naturalLanguageInput }),
    });
  }

  async updateRfp(id: string, data: Partial<Rfp>): Promise<ApiResponse<Rfp>> {
    return this.request<ApiResponse<Rfp>>(`/rfps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRfp(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(`/rfps/${id}`, {
      method: 'DELETE',
    });
  }

  async sendRfp(id: string, vendorIds: string[]): Promise<ApiResponse<{ message: string; sentCount: number }>> {
    return this.request<ApiResponse<{ message: string; sentCount: number }>>(`/rfps/${id}/send`, {
      method: 'POST',
      body: JSON.stringify({ vendorIds }),
    });
  }

  async getProposalsByRfp(rfpId: string): Promise<ApiResponse<Proposal[]>> {
    return this.request<ApiResponse<Proposal[]>>(`/rfps/${rfpId}/proposals`);
  }

  async compareProposals(rfpId: string): Promise<ApiResponse<ComparisonResult>> {
    return this.request<ApiResponse<ComparisonResult>>(`/rfps/${rfpId}/compare`, {
      method: 'POST',
    });
  }

  // ============================================
  // Vendor Endpoints
  // ============================================

  async getVendors(
    page = 1,
    limit = 10,
    search?: string,
    status?: 'ACTIVE' | 'INACTIVE'
  ): Promise<ApiResponse<Vendor[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    return this.request<ApiResponse<Vendor[]>>(`/vendors?${params.toString()}`);
  }

  async getVendorById(id: string): Promise<ApiResponse<Vendor>> {
    return this.request<ApiResponse<Vendor>>(`/vendors/${id}`);
  }

  async createVendor(data: CreateVendorRequest): Promise<ApiResponse<Vendor>> {
    return this.request<ApiResponse<Vendor>>('/vendors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVendor(id: string, data: UpdateVendorRequest): Promise<ApiResponse<Vendor>> {
    return this.request<ApiResponse<Vendor>>(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVendor(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(`/vendors/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // Proposal Endpoints
  // ============================================

  async getProposalById(id: string): Promise<ApiResponse<Proposal>> {
    return this.request<ApiResponse<Proposal>>(`/proposals/${id}`);
  }

  async createProposal(data: {
    rfpId: string;
    vendorId: string;
    rawContent: string;
    rawSubject?: string;
  }): Promise<ApiResponse<Proposal>> {
    return this.request<ApiResponse<Proposal>>('/proposals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
