"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { candidateService } from "@/services/candidate.service";
import { useCandidateFilterStore } from "@/stores/use-candidate-filter-store";
import { DEFAULT_PAGE_SIZE } from "@/lib/candidate-filter-params";
import type {
  CandidateSearchErrorCode,
  CandidateSearchFilters,
  CandidateSearchMeta,
  CandidateSearchRow,
} from "@/types/candidate-search.types";

/**
 * Runs the candidate search for whatever the store has *applied*.
 *
 * The draft filters are deliberately not watched: the panel commits with SEARCH,
 * and until then nothing is fetched. Paging and refetching go through the same
 * path so there is one place where results are written.
 */

export interface UseCandidateSearchResult {
  rows: CandidateSearchRow[];
  meta: CandidateSearchMeta;
  loading: boolean;
  error: { code: CandidateSearchErrorCode; message: string } | null;
  refetch: () => Promise<void>;
}

const emptyMeta = (page: number, limit: number): CandidateSearchMeta => ({
  total: 0,
  page,
  limit,
  totalPages: 0,
});

export function useCandidateSearch(): UseCandidateSearchResult {
  const applied = useCandidateFilterStore((state) => state.applied);

  const [rows, setRows] = useState<CandidateSearchRow[]>([]);
  const [meta, setMeta] = useState<CandidateSearchMeta>(() => emptyMeta(1, DEFAULT_PAGE_SIZE));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ code: CandidateSearchErrorCode; message: string } | null>(null);

  // With sixteen filter groups the user outruns the network constantly, so
  // responses do come back out of order. Every request takes a ticket and only
  // the newest ticket is allowed to write state — otherwise a slow early search
  // lands on top of a fast later one and the table shows the wrong result set.
  const requestIdRef = useRef<number>(0);

  const runSearch = useCallback(async (filters: CandidateSearchFilters) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);

    const response = await candidateService.search(filters);
    if (requestId !== requestIdRef.current) return;

    if (response.success) {
      setRows(response.data);
      setMeta(response.meta);
      setError(null);
    } else {
      // An error is not an empty directory: clear the rows but keep the reason.
      setRows([]);
      setMeta(emptyMeta(filters.page ?? 1, filters.limit ?? DEFAULT_PAGE_SIZE));
      setError({ code: response.code, message: response.error });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void runSearch(applied);
  }, [applied, runSearch]);

  // Reads the store directly so a refetch after a mutation always uses the
  // current filters, even if the caller closed over an older copy.
  const refetch = useCallback(async () => {
    await runSearch(useCandidateFilterStore.getState().applied);
  }, [runSearch]);

  return { rows, meta, loading, error, refetch };
}
