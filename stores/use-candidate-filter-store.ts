import { create } from "zustand";
import { DEFAULT_PAGE_SIZE } from "@/lib/candidate-filter-params";
import type { CandidateSearchFilters } from "@/types/candidate-search.types";

/**
 * Candidate search filter state.
 *
 * Two copies are kept on purpose. `draft` is what the filter panel edits as the
 * user clicks around; `applied` is what the data hook actually queries. Nothing
 * is fetched until SEARCH commits the draft, so a sixteen-group panel does not
 * fire sixteen requests while it is being filled in.
 *
 * Pagination is the exception: page and limit live on `applied` only and take
 * effect immediately, because paging through results is not a filter edit.
 */
interface CandidateFilterStore {
  applied: CandidateSearchFilters;
  draft: CandidateSearchFilters;
  setDraft: (patch: Partial<CandidateSearchFilters>) => void;
  toggleValue: (key: keyof CandidateSearchFilters, value: string) => void;
  apply: () => void;
  reset: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

const initialFilters = (): CandidateSearchFilters => ({
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
});

export const useCandidateFilterStore = create<CandidateFilterStore>((set) => ({
  applied: initialFilters(),
  draft: initialFilters(),

  setDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),

  toggleValue: (key, value) =>
    set((state) => {
      const current = (state.draft[key] as string[] | undefined) ?? [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

      // An empty array would still serialize as a key, so drop it entirely.
      const draft = { ...state.draft } as Record<string, unknown>;
      if (next.length > 0) draft[key] = next;
      else delete draft[key];

      return { draft: draft as CandidateSearchFilters };
    }),

  // A new search always starts at page 1; the chosen page size is a view
  // preference and survives.
  apply: () =>
    set((state) => ({
      applied: { ...state.draft, page: 1, limit: state.applied.limit ?? DEFAULT_PAGE_SIZE },
    })),

  reset: () =>
    set((state) => ({
      applied: { ...initialFilters(), limit: state.applied.limit ?? DEFAULT_PAGE_SIZE },
      draft: { ...initialFilters(), limit: state.applied.limit ?? DEFAULT_PAGE_SIZE },
    })),

  setPage: (page) => set((state) => ({ applied: { ...state.applied, page } })),

  setLimit: (limit) => set((state) => ({ applied: { ...state.applied, limit, page: 1 } })),
}));
