import { create } from "zustand";

interface FilterState {
  searchQuery: string;
  departmentFilter: string;
  statusFilter: string;
  page: number;
  limit: number;
  setSearchQuery: (query: string) => void;
  setDepartmentFilter: (dept: string) => void;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: "",
  departmentFilter: "all",
  statusFilter: "all",
  page: 1,
  limit: 10,
  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setDepartmentFilter: (dept) => set({ departmentFilter: dept, page: 1 }),
  setStatusFilter: (status) => set({ statusFilter: status, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () =>
    set({
      searchQuery: "",
      departmentFilter: "all",
      statusFilter: "all",
      page: 1,
    }),
}));
