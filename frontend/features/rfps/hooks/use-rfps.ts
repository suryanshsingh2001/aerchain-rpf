'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Rfp, ApiResponse, PaginationMeta } from '@/lib/types';

export function useRfps() {
  const [rfps, setRfps] = useState<Rfp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchRfps = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getRfps(page, limit);
      setRfps(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch RFPs');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRfp = useCallback(async (naturalLanguageInput: string): Promise<Rfp | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.createRfp(naturalLanguageInput);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create RFP');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRfp = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteRfp(id);
      setRfps((prev) => prev.filter((rfp) => rfp.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete RFP');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendRfp = useCallback(async (id: string, vendorIds: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await api.sendRfp(id, vendorIds);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send RFP');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rfps,
    loading,
    error,
    pagination,
    fetchRfps,
    createRfp,
    deleteRfp,
    sendRfp,
  };
}

export function useRfp(id: string) {
  const [rfp, setRfp] = useState<Rfp | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRfp = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getRfpById(id);
      setRfp(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch RFP');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateRfp = useCallback(async (data: Partial<Rfp>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.updateRfp(id, data);
      setRfp(response.data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update RFP');
      return false;
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    rfp,
    loading,
    error,
    fetchRfp,
    updateRfp,
    setRfp,
  };
}
