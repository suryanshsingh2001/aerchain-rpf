'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Vendor, CreateVendorRequest, UpdateVendorRequest, PaginationMeta } from '@/lib/types';

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchVendors = useCallback(async (
    page = 1,
    limit = 10,
    search?: string,
    status?: 'ACTIVE' | 'INACTIVE'
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getVendors(page, limit, search, status);
      setVendors(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  }, []);

  const createVendor = useCallback(async (data: CreateVendorRequest): Promise<Vendor | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.createVendor(data);
      setVendors((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vendor');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVendor = useCallback(async (id: string, data: UpdateVendorRequest): Promise<Vendor | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.updateVendor(id, data);
      setVendors((prev) => prev.map((v) => (v.id === id ? response.data : v)));
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVendor = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteVendor(id);
      setVendors((prev) => prev.filter((v) => v.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vendor');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    vendors,
    loading,
    error,
    pagination,
    fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
  };
}

export function useVendor(id: string) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVendor = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getVendorById(id);
      setVendor(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vendor');
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    vendor,
    loading,
    error,
    fetchVendor,
    setVendor,
  };
}
