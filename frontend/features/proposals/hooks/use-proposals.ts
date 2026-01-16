'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Proposal, ComparisonResult } from '@/lib/types';

export function useProposals(rfpId: string) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [comparing, setComparing] = useState(false);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getProposalsByRfp(rfpId);
      setProposals(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  }, [rfpId]);

  const compareProposals = useCallback(async (): Promise<ComparisonResult | null> => {
    setComparing(true);
    setError(null);
    try {
      const response = await api.compareProposals(rfpId);
      setComparison(response.data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare proposals');
      return null;
    } finally {
      setComparing(false);
    }
  }, [rfpId]);

  const createProposal = useCallback(async (data: {
    vendorId: string;
    rawContent: string;
    rawSubject?: string;
  }): Promise<Proposal | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.createProposal({ ...data, rfpId });
      setProposals((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create proposal');
      return null;
    } finally {
      setLoading(false);
    }
  }, [rfpId]);

  return {
    proposals,
    loading,
    error,
    comparison,
    comparing,
    fetchProposals,
    compareProposals,
    createProposal,
  };
}
