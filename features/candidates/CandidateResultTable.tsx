"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeProps } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  AVAILABILITIES,
  DISTRICTS,
  DIVISIONS,
  EDUCATION_BOARDS,
  EDUCATION_LEVELS,
  GENDERS,
  PROFESSIONS,
  type Availability,
  type FilterOption,
} from "@/constants/candidate-filters";
import type { CandidateSearchMeta, CandidateSearchRow, Project } from "@/types/candidate-search.types";

/**
 * The result table.
 *
 * Rows arrive as slugs (`ssc`, `coxs_bazar`, `security_guard`); every one of
 * them is rendered through its label from constants/candidate-filters so the
 * screen never shows a database value. A missing value is an em dash — never
 * the string "null" and never a blank cell that reads as a layout bug.
 */

interface CandidateResultTableProps {
  rows: CandidateSearchRow[];
  meta: CandidateSearchMeta;
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onPageChange: (page: number) => void;
  projects: Project[];
}

/* ---------------------------------------------------------------- labels */

const toLabels = (options: readonly FilterOption[]): Record<string, string> =>
  Object.fromEntries(options.map((option) => [option.value, option.label]));

const GENDER_LABELS = toLabels(GENDERS);
const EDUCATION_LEVEL_LABELS = toLabels(EDUCATION_LEVELS);
const EDUCATION_BOARD_LABELS = toLabels(EDUCATION_BOARDS);
const PROFESSION_LABELS = toLabels(PROFESSIONS);
const DIVISION_LABELS = toLabels(DIVISIONS);
const DISTRICT_LABELS: Record<string, string> = Object.fromEntries(DISTRICTS.map((d) => [d.value, d.label]));
const AVAILABILITY_LABELS = toLabels(AVAILABILITIES);

const AVAILABILITY_VARIANTS: Record<Availability, BadgeProps["variant"]> = {
  active: "success",
  available: "default",
  assigned: "warning",
  inactive: "secondary",
};

/** An unknown slug still beats showing nothing, so fall back to the raw value. */
const labelOf = (labels: Record<string, string>, value: string | null): string | null =>
  value ? labels[value] ?? value : null;

function Dash() {
  return <span className="text-slate-400 dark:text-slate-600">—</span>;
}

/** numeric(4,1) — "5 yrs", "2.5 yrs", "1 yr". */
function formatExperience(years: number | null): string | null {
  if (years === null || !Number.isFinite(years)) return null;
  const rounded = Math.round(years * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${text} ${rounded === 1 ? "yr" : "yrs"}`;
}

/* ----------------------------------------------------------------- table */

export function CandidateResultTable({
  rows,
  meta,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onPageChange,
  projects,
}: CandidateResultTableProps) {
  // Selection is page-scoped: the header checkbox reflects this page only.
  const isAllSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));

  const projectNames = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project.name])) as Record<string, string>,
    [projects]
  );

  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  const columns: Column<CandidateSearchRow>[] = [
    {
      header: (
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={onToggleSelectAll}
          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#1657FF] focus:ring-[#1657FF] dark:border-slate-600 dark:bg-slate-800"
          title="Select / Deselect all on this page"
        />
      ),
      cell: (item) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(item.id)}
          onChange={() => onToggleSelect(item.id)}
          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#1657FF] focus:ring-[#1657FF] dark:border-slate-600 dark:bg-slate-800"
          aria-label={`Select ${item.name}`}
        />
      ),
      className: "w-10 px-2 text-center",
    },
    {
      header: "Employee ID",
      accessorKey: "employeeId",
      cell: (item) => (
        <span className="font-mono text-sm font-bold text-[#1657FF] dark:text-blue-400">
          {item.employeeId || item.id}
        </span>
      ),
    },
    {
      header: "Candidate",
      cell: (item) => (
        <Link href={`/employees/${item.id}`}>
          <div className="group flex cursor-pointer items-center space-x-3">
            <Avatar src={item.avatarUrl ?? undefined} name={item.name} size="md" />
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-slate-900 transition-colors group-hover:text-[#1657FF] dark:text-slate-100">
                {item.name}
              </p>
              <p className="text-xs font-medium text-slate-500">{item.phone || "—"}</p>
            </div>
          </div>
        </Link>
      ),
    },
    {
      header: "Age / Gender",
      cell: (item) => (
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {item.age !== null ? `${item.age} yrs` : <Dash />}
          </p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {labelOf(GENDER_LABELS, item.gender) ?? <Dash />}
          </p>
        </div>
      ),
    },
    {
      header: "Profession",
      cell: (item) => {
        const label = labelOf(PROFESSION_LABELS, item.profession) ?? item.designation;
        return label ? (
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</span>
        ) : (
          <Dash />
        );
      },
    },
    {
      header: "Education",
      cell: (item) => {
        const level = labelOf(EDUCATION_LEVEL_LABELS, item.educationLevel);
        const board = labelOf(EDUCATION_BOARD_LABELS, item.educationBoard);
        return (
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{level ?? <Dash />}</p>
            {board && <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{board}</p>}
          </div>
        );
      },
    },
    {
      header: "Experience",
      accessorKey: "experienceYears",
      cell: (item) => {
        const experience = formatExperience(item.experienceYears);
        return experience ? (
          <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{experience}</span>
        ) : (
          <Dash />
        );
      },
    },
    {
      header: "District",
      cell: (item) => {
        const district = labelOf(DISTRICT_LABELS, item.district);
        const division = labelOf(DIVISION_LABELS, item.division);
        return (
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{district ?? <Dash />}</p>
            {division && <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{division}</p>}
          </div>
        );
      },
    },
    {
      header: "Availability",
      cell: (item) =>
        item.availability ? (
          <Badge variant={AVAILABILITY_VARIANTS[item.availability]}>
            {labelOf(AVAILABILITY_LABELS, item.availability)}
          </Badge>
        ) : (
          <Dash />
        ),
    },
    {
      header: "Project",
      cell: (item) => {
        // projectName comes joined from the API; the projects list is the
        // fallback for a row fetched before the join was available.
        const name = item.projectName ?? (item.projectId ? projectNames[item.projectId] ?? item.projectId : null);
        return name ? (
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{name}</span>
        ) : (
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Unassigned</span>
        );
      },
    },
    {
      header: "Actions",
      cell: (item) => (
        <div className="flex items-center justify-end space-x-1">
          <Link href={`/employees/${item.id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-500 hover:text-[#1657FF]"
              title="View candidate profile"
            >
              <Eye className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-bold text-slate-500 dark:text-slate-400">
        {/* A search in flight has no count yet; "nothing matched" would be a claim we cannot make. */}
        {loading
          ? "Searching…"
          : meta.total === 0
          ? "No candidates match the current filters"
          : `Showing ${from.toLocaleString()}–${to.toLocaleString()} of ${meta.total.toLocaleString()} candidates`}
      </p>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={loading}
        emptyTitle="No candidates found"
        emptyDescription="Adjust or reset the filters to widen the search."
        page={meta.page}
        totalPages={meta.totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
