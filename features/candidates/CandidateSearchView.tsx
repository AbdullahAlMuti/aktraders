"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Database, Download, ListFilter, Loader2, Tags, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CandidateFilterPanel } from "./CandidateFilterPanel";
import { CandidateResultTable } from "./CandidateResultTable";
import { BulkAssignModal } from "./BulkAssignModal";
import { useCandidateSearch } from "./use-candidate-search";
import { useCandidateFilterStore } from "@/stores/use-candidate-filter-store";
import { candidateService } from "@/services/candidate.service";
import { employeeService } from "@/services/employee.service";
import type { Project } from "@/types/candidate-search.types";
import { countActiveFilters } from "@/lib/candidate-filter-params";
import { toast } from "@/hooks/use-toast";

/**
 * Orchestrates the candidate directory: filter panel, results, selection and the
 * two bulk actions (assign, export). Data fetching lives in useCandidateSearch;
 * filter state lives in the store. This component only wires them together.
 */
export function CandidateSearchView() {
  const { applied, setPage } = useCandidateFilterStore();
  const { rows, meta, loading, error, refetch } = useCandidateSearch();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    let cancelled = false;
    candidateService
      .getProjects()
      .then((list) => {
        if (!cancelled) setProjects(list);
      })
      .catch(() => {
        /* Projects are optional context; the directory still works without them. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Selection is per result set: changing the filters invalidates what was picked.
  useEffect(() => {
    setSelectedIds([]);
  }, [applied]);

  const activeCount = useMemo(() => countActiveFilters(applied), [applied]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const pageIds = rows.map((r) => r.id);
      const allSelected = pageIds.length > 0 && pageIds.every((id) => prev.includes(id));
      return allSelected ? prev.filter((id) => !pageIds.includes(id)) : Array.from(new Set([...prev, ...pageIds]));
    });
  }, [rows]);

  const handleExport = useCallback(() => {
    if (meta.total === 0) {
      toast.warning("Nothing to export", "No candidates match the current filters.");
      return;
    }
    // The export endpoint re-runs the same filters server-side, so the file
    // covers every match — not just the rows visible on this page.
    window.location.href = candidateService.exportUrl(applied);
    toast.success("Export started", `Preparing ${meta.total} candidate record(s) as CSV.`);
  }, [applied, meta.total]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const count = selectedIds.length;
      const ok = await employeeService.deleteMultipleEmployees(selectedIds);
      if (ok) {
        toast.success("Records deleted", `Removed ${count} candidate record(s).`);
        setSelectedIds([]);
        await refetch();
      } else {
        toast.error("Delete failed", "Could not remove the selected records from the database.");
      }
    } catch {
      toast.error("Delete error", "An unexpected error occurred while deleting.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }, [selectedIds, refetch]);

  if (error?.code === "MIGRATION_REQUIRED") {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 dark:border-amber-900/60 dark:bg-amber-950/30">
        <div className="flex items-start space-x-3">
          <div className="rounded-full bg-amber-100 p-2.5 dark:bg-amber-900/50">
            <Database className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-amber-900 dark:text-amber-200">Database migration required</h3>
            <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-300">{error.message}</p>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Run <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900/60">supabase/migrations/20260810_candidate_search.sql</code> in
              the Supabase SQL editor, then backfill with{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900/60">npx tsx scripts/backfill-search-index.ts --apply</code>.
            </p>
            <Button variant="outline" size="sm" onClick={refetch} className="mt-1 rounded-xl font-bold">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      {/* Desktop filter sidebar */}
      <aside className="hidden w-full shrink-0 lg:block lg:w-80">
        <CandidateFilterPanel projects={projects} resultCount={meta.total} loading={loading} />
      </aside>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-label="Filter candidates">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="relative ml-auto flex h-full w-[88%] max-w-sm flex-col overflow-y-auto bg-slate-50 p-4 dark:bg-[#0b152c]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)} aria-label="Close filters">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <CandidateFilterPanel projects={projects} resultCount={meta.total} loading={loading} />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-[#111c38]">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileFilters(true)}
              leftIcon={<ListFilter className="h-4 w-4" />}
              className="rounded-xl text-sm font-bold lg:hidden"
            >
              Filters
              {activeCount > 0 && <Badge className="ml-2">{activeCount}</Badge>}
            </Button>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching…
                </span>
              ) : (
                <>
                  {meta.total.toLocaleString()} candidate{meta.total === 1 ? "" : "s"}
                  {activeCount > 0 && (
                    <span className="ml-1.5 font-medium text-slate-500">
                      · {activeCount} filter{activeCount === 1 ? "" : "s"} active
                    </span>
                  )}
                </>
              )}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading || meta.total === 0}
            leftIcon={<Download className="h-4 w-4" />}
            className="rounded-xl text-sm font-bold"
          >
            Export CSV
          </Button>
        </div>

        {/* MIGRATION_REQUIRED is handled by the early return above. */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div className="space-y-2">
              <p className="text-sm font-bold text-rose-900 dark:text-rose-200">Could not load candidates</p>
              <p className="text-sm text-rose-800 dark:text-rose-300">{error.message}</p>
              <Button variant="outline" size="sm" onClick={refetch} className="rounded-xl font-bold">
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Bulk action bar */}
        {selectedIds.length > 0 && (
          <div className="animate-fadeIn flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-3.5 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/40">
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 dark:text-blue-200">
              <span className="rounded-full bg-[#1657FF] px-2.5 py-1 text-xs font-extrabold text-white">
                {selectedIds.length} Selected
              </span>
              <span>
                {selectedIds.length === 1 ? "1 candidate selected" : `${selectedIds.length} candidates selected`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds([])}
                className="rounded-xl border-blue-200 text-xs font-semibold dark:border-blue-800"
              >
                Clear Selection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                leftIcon={<Trash2 className="h-4 w-4" />}
                className="rounded-xl border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
              >
                Delete
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAssignModal(true)}
                leftIcon={<Tags className="h-4 w-4" />}
                className="rounded-xl bg-[#1657FF] text-xs font-bold text-white hover:bg-blue-700"
              >
                Bulk Assign ({selectedIds.length})
              </Button>
            </div>
          </div>
        )}

        <CandidateResultTable
          rows={rows}
          meta={meta}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onPageChange={setPage}
          projects={projects}
        />
      </div>

      <BulkAssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        selectedIds={selectedIds}
        projects={projects}
        onAssigned={() => {
          setShowAssignModal(false);
          setSelectedIds([]);
          void refetch();
        }}
      />

      {showDeleteModal && (
        <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#111c38]">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="rounded-full bg-rose-100 p-3 dark:bg-rose-950/60">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Delete {selectedIds.length} candidate record{selectedIds.length === 1 ? "" : "s"}
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              This permanently removes{" "}
              <strong className="text-rose-600 dark:text-rose-400">{selectedIds.length} profile(s)</strong> and their CV
              records from the database. This cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-xl font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                leftIcon={isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                className="rounded-xl bg-rose-600 font-bold text-white hover:bg-rose-700"
              >
                {isDeleting ? "Deleting…" : `Delete ${selectedIds.length}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
