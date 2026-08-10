import { serializeFilters } from "@/lib/candidate-filter-params";
import type {
  BulkAssignPayload,
  BulkAssignResponse,
  CandidateSearchFilters,
  CandidateSearchResponse,
  Project,
} from "@/types/candidate-search.types";

/**
 * Client for the candidate search endpoints.
 *
 * The query string is always produced by `serializeFilters` so the caller and
 * the route stay on the same wire format; hand-rolling it here is how the two
 * sides drift apart.
 *
 * A failed request is returned as a failure, never as an empty result set —
 * "the database is unreachable" and "no candidate matches" are different
 * answers and the UI shows different things for each.
 */

const NETWORK_ERROR = "Could not reach the server. Check your connection and try again.";

export const candidateService = {
  async search(filters: CandidateSearchFilters): Promise<CandidateSearchResponse> {
    const params = serializeFilters(filters);
    params.set("_t", String(Date.now()));

    try {
      const res = await fetch(`/api/candidates/search?${params.toString()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      // An HTML error page or an empty body is not JSON; treat it as no payload
      // rather than letting the parse throw.
      const json = (await res.json().catch(() => null)) as CandidateSearchResponse | null;

      if (json?.success === true) return json;
      // The route already classified the failure (MIGRATION_REQUIRED and friends);
      // pass that code through untouched so the banner can act on it.
      if (json?.success === false) return json;

      return {
        success: false,
        code: "DB_UNREACHABLE",
        error: `The search API responded with status ${res.status}.`,
      };
    } catch (e) {
      console.error("Error searching candidates:", e);
      return { success: false, code: "DB_UNREACHABLE", error: NETWORK_ERROR };
    }
  },

  async bulkAssign(payload: BulkAssignPayload): Promise<BulkAssignResponse> {
    try {
      const res = await fetch("/api/candidates/bulk-assign", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as BulkAssignResponse | null;

      if (json?.success === true) return json;
      if (json?.success === false) return json;

      return {
        success: false,
        code: "DB_UNREACHABLE",
        error: `The bulk assign API responded with status ${res.status}.`,
      };
    } catch (e) {
      console.error("Error bulk assigning candidates:", e);
      return { success: false, code: "DB_UNREACHABLE", error: NETWORK_ERROR };
    }
  },

  /**
   * href for the CSV export. Page and limit are dropped on purpose: the export
   * covers every matching row, not the window currently on screen.
   */
  exportUrl(filters: CandidateSearchFilters): string {
    const { page, limit, ...rest } = filters;
    return `/api/candidates/export?${serializeFilters(rest).toString()}`;
  },

  async getProjects(): Promise<Project[]> {
    try {
      const res = await fetch(`/api/projects?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const json = (await res.json().catch(() => null)) as
        | { success?: boolean; data?: Project[]; error?: string }
        | null;
      if (res.ok && json?.success && Array.isArray(json.data)) return json.data;
      // "The projects table could not be read" and "no projects exist yet" both
      // end up as an empty list here, so at least say which one happened.
      console.error("Error fetching projects:", json?.error ?? `The projects API responded with status ${res.status}.`);
    } catch (e) {
      console.error("Error fetching projects:", e);
    }
    // Projects are context for the filter panel and the assign modal; the
    // directory still works without them, so an empty list is the honest answer.
    return [];
  },
};
