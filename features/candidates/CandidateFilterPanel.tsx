"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, RotateCcw, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCandidateFilterStore } from "@/stores/use-candidate-filter-store";
import { countActiveFilters } from "@/lib/candidate-filter-params";
import {
  AVAILABILITIES,
  CV_QUALITIES,
  DEPARTMENTS,
  DIVISIONS,
  EDUCATION_BOARDS,
  EDUCATION_LEVELS,
  EXPERIENCE_PRESETS,
  GENDERS,
  MANPOWER_CATEGORIES,
  PROFESSIONS,
  SECTORS,
  SHIFTS,
  TRAINING_TYPES,
  WORK_TYPES,
  districtsInDivision,
  type Division,
  type FilterOption,
} from "@/constants/candidate-filters";
import type { Project } from "@/types/candidate-search.types";
import { cn } from "@/utils/cn";

/**
 * The sixteen filter groups from the requirement mockup.
 *
 * The panel only edits the store's draft; nothing is fetched until SEARCH
 * commits it. Every group collapses independently and starts closed except the
 * four that staff open on almost every search — sixteen expanded groups is a
 * wall nobody scrolls through.
 */

interface CandidateFilterPanelProps {
  className?: string;
  resultCount?: number;
  loading?: boolean;
  projects: Project[];
}

/* ------------------------------------------------------------ small pieces */

function FilterGroup({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const contentId = useId();

  return (
    <section className="border-b border-slate-100 last:border-b-0 dark:border-slate-800/80">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1657FF] dark:hover:bg-slate-800/50"
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</span>
          {count > 0 && <Badge className="px-2 py-0 text-[11px] font-bold">{count}</Badge>}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150", open && "rotate-180")}
        />
      </button>
      {open && (
        <div id={contentId} className="space-y-2.5 px-1 pb-3 pt-0.5">
          {children}
        </div>
      )}
    </section>
  );
}

function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-0.5 text-sm leading-snug text-slate-700 dark:text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-[#0066ff] focus:ring-[#0066ff] dark:border-slate-600 dark:bg-slate-800"
      />
      <span>{label}</span>
    </label>
  );
}

function OptionCheckboxList({
  options,
  selected,
  onToggle,
  scrollable = false,
}: {
  options: readonly FilterOption[];
  selected: readonly string[];
  onToggle: (value: string) => void;
  scrollable?: boolean;
}) {
  return (
    <div className={cn("space-y-0.5", scrollable && "max-h-56 overflow-y-auto pr-1")}>
      {options.map((option) => (
        <CheckboxItem
          key={option.value}
          label={option.label}
          checked={selected.includes(option.value)}
          onChange={() => onToggle(option.value)}
        />
      ))}
    </div>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{children}</p>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-bold text-slate-600 dark:text-slate-300">
      {children}
    </label>
  );
}

/** "" clears the bound filter; anything unparseable is treated as cleared too. */
function toNumber(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const count = (values?: readonly string[]) => values?.length ?? 0;

/* ------------------------------------------------------------------ panel */

export function CandidateFilterPanel({ className, resultCount, loading, projects }: CandidateFilterPanelProps) {
  const draft = useCandidateFilterStore((state) => state.draft);
  const setDraft = useCandidateFilterStore((state) => state.setDraft);
  const toggleValue = useCandidateFilterStore((state) => state.toggleValue);
  const apply = useCandidateFilterStore((state) => state.apply);
  const reset = useCandidateFilterStore((state) => state.reset);

  const uid = useId();
  const activeCount = useMemo(() => countActiveFilters(draft), [draft]);

  const selectedDivision = draft.division?.[0] ?? "";
  const selectedDistrict = draft.district?.[0] ?? "";

  const divisionOptions = useMemo(
    () => [{ value: "", label: "All Divisions" }, ...DIVISIONS.map((d) => ({ value: d.value, label: d.label }))],
    []
  );
  const districtOptions = useMemo(
    () => [
      { value: "", label: "All Districts" },
      ...districtsInDivision(selectedDivision || undefined).map((d) => ({ value: d.value, label: d.label })),
    ],
    [selectedDivision]
  );

  // Districts are scoped to the division, so a district left over from a
  // previous division would keep constraining the query while invisible.
  const handleDivisionChange = (value: string) =>
    setDraft({ division: value ? [value as Division] : undefined, district: undefined });

  const experienceMatches = (min: number, max: number | undefined) =>
    draft.minExperience === min && draft.maxExperience === max;

  const handleExperiencePreset = (min: number, max: number | undefined) =>
    setDraft(
      experienceMatches(min, max)
        ? { minExperience: undefined, maxExperience: undefined }
        : { minExperience: min, maxExperience: max }
    );

  // Trained / Not Trained is tri-state: clicking the checked one clears the
  // constraint rather than flipping to the opposite.
  const handleTrainedToggle = (value: boolean) =>
    setDraft({ isTrained: draft.isTrained === value ? undefined : value });

  const trainingCount = count(draft.trainingTypes) + (typeof draft.isTrained === "boolean" ? 1 : 0);
  const projectCount = count(draft.projectId) + (draft.unassignedProject ? 1 : 0);

  return (
    <div
      className={cn(
        "flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111c38] lg:sticky lg:top-6",
        className
      )}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-1">
        {/* 1. Keyword */}
        <FilterGroup title="Keyword" count={draft.keyword?.trim() ? 1 : 0} defaultOpen>
          <Input
            id={`${uid}-keyword`}
            type="search"
            value={draft.keyword ?? ""}
            onChange={(event) => setDraft({ keyword: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter") apply();
            }}
            placeholder="Name / Employee ID / Phone / Profession"
            aria-label="Keyword: name, employee ID, phone or profession"
            leftIcon={<Search className="h-4 w-4" />}
          />
        </FilterGroup>

        {/* 2. Age */}
        <FilterGroup
          title="Age"
          count={draft.minAge !== undefined || draft.maxAge !== undefined ? 1 : 0}
          defaultOpen
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <FieldLabel htmlFor={`${uid}-min-age`}>Min</FieldLabel>
              <Input
                id={`${uid}-min-age`}
                type="number"
                min={0}
                max={120}
                inputMode="numeric"
                placeholder="18"
                value={draft.minAge ?? ""}
                onChange={(event) => setDraft({ minAge: toNumber(event.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <FieldLabel htmlFor={`${uid}-max-age`}>Max</FieldLabel>
              <Input
                id={`${uid}-max-age`}
                type="number"
                min={0}
                max={120}
                inputMode="numeric"
                placeholder="60"
                value={draft.maxAge ?? ""}
                onChange={(event) => setDraft({ maxAge: toNumber(event.target.value) })}
              />
            </div>
          </div>
        </FilterGroup>

        {/* 3. Gender */}
        <FilterGroup title="Gender" count={count(draft.gender)} defaultOpen>
          <OptionCheckboxList
            options={GENDERS}
            selected={draft.gender ?? []}
            onToggle={(value) => toggleValue("gender", value)}
          />
        </FilterGroup>

        {/* 4. Education */}
        <FilterGroup title="Education" count={count(draft.educationLevel) + count(draft.educationBoard)}>
          <SubHeading>Level</SubHeading>
          <OptionCheckboxList
            options={EDUCATION_LEVELS}
            selected={draft.educationLevel ?? []}
            onToggle={(value) => toggleValue("educationLevel", value)}
          />
          <SubHeading>Board</SubHeading>
          <OptionCheckboxList
            options={EDUCATION_BOARDS}
            selected={draft.educationBoard ?? []}
            onToggle={(value) => toggleValue("educationBoard", value)}
          />
        </FilterGroup>

        {/* 5. Job Category */}
        <FilterGroup title="Job Category" count={count(draft.manpowerCategory)}>
          <OptionCheckboxList
            options={MANPOWER_CATEGORIES}
            selected={draft.manpowerCategory ?? []}
            onToggle={(value) => toggleValue("manpowerCategory", value)}
          />
        </FilterGroup>

        {/* 6. Profession */}
        <FilterGroup title="Profession" count={count(draft.profession)} defaultOpen>
          <OptionCheckboxList
            options={PROFESSIONS}
            selected={draft.profession ?? []}
            onToggle={(value) => toggleValue("profession", value)}
            scrollable
          />
        </FilterGroup>

        {/* 7. Department */}
        <FilterGroup title="Department" count={count(draft.department)}>
          <OptionCheckboxList
            options={DEPARTMENTS}
            selected={draft.department ?? []}
            onToggle={(value) => toggleValue("department", value)}
            scrollable
          />
        </FilterGroup>

        {/* 8. Work Type */}
        <FilterGroup title="Work Type" count={count(draft.workType)}>
          <OptionCheckboxList
            options={WORK_TYPES}
            selected={draft.workType ?? []}
            onToggle={(value) => toggleValue("workType", value)}
          />
        </FilterGroup>

        {/* 9. Shift */}
        <FilterGroup title="Shift" count={count(draft.shift)}>
          <OptionCheckboxList
            options={SHIFTS}
            selected={draft.shift ?? []}
            onToggle={(value) => toggleValue("shift", value)}
          />
        </FilterGroup>

        {/* 10. Training */}
        <FilterGroup title="Training" count={trainingCount}>
          <SubHeading>Status</SubHeading>
          <div className="space-y-0.5">
            <CheckboxItem
              label="Trained"
              checked={draft.isTrained === true}
              onChange={() => handleTrainedToggle(true)}
            />
            <CheckboxItem
              label="Not Trained"
              checked={draft.isTrained === false}
              onChange={() => handleTrainedToggle(false)}
            />
          </div>
          <SubHeading>Training Type</SubHeading>
          <OptionCheckboxList
            options={TRAINING_TYPES}
            selected={draft.trainingTypes ?? []}
            onToggle={(value) => toggleValue("trainingTypes", value)}
          />
        </FilterGroup>

        {/* 11. Experience */}
        <FilterGroup
          title="Experience"
          count={draft.minExperience !== undefined || draft.maxExperience !== undefined ? 1 : 0}
        >
          <div className="flex flex-wrap gap-1.5">
            {EXPERIENCE_PRESETS.map((preset) => {
              const active = experienceMatches(preset.min, preset.max);
              return (
                <button
                  key={preset.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleExperiencePreset(preset.min, preset.max)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1657FF]",
                    active
                      ? "border-[#1657FF] bg-[#1657FF] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#1657FF] hover:text-[#1657FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <FieldLabel htmlFor={`${uid}-min-exp`}>Min years</FieldLabel>
              <Input
                id={`${uid}-min-exp`}
                type="number"
                min={0}
                max={60}
                inputMode="numeric"
                placeholder="0"
                value={draft.minExperience ?? ""}
                onChange={(event) => setDraft({ minExperience: toNumber(event.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <FieldLabel htmlFor={`${uid}-max-exp`}>Max years</FieldLabel>
              <Input
                id={`${uid}-max-exp`}
                type="number"
                min={0}
                max={60}
                inputMode="numeric"
                placeholder="40"
                value={draft.maxExperience ?? ""}
                onChange={(event) => setDraft({ maxExperience: toNumber(event.target.value) })}
              />
            </div>
          </div>
        </FilterGroup>

        {/* 12. CV Status */}
        <FilterGroup title="CV Status" count={count(draft.cvQuality)}>
          <OptionCheckboxList
            options={CV_QUALITIES}
            selected={draft.cvQuality ?? []}
            onToggle={(value) => toggleValue("cvQuality", value)}
          />
        </FilterGroup>

        {/* 13. Employment Status */}
        <FilterGroup title="Employment Status" count={count(draft.availability)}>
          <OptionCheckboxList
            options={AVAILABILITIES}
            selected={draft.availability ?? []}
            onToggle={(value) => toggleValue("availability", value)}
          />
        </FilterGroup>

        {/* 14. Government / Private */}
        <FilterGroup title="Government / Private" count={count(draft.sector)}>
          <OptionCheckboxList
            options={SECTORS}
            selected={draft.sector ?? []}
            onToggle={(value) => toggleValue("sector", value)}
          />
        </FilterGroup>

        {/* 15. Project */}
        <FilterGroup title="Project" count={projectCount}>
          <CheckboxItem
            label="Unassigned"
            checked={draft.unassignedProject === true}
            onChange={() => setDraft({ unassignedProject: draft.unassignedProject ? undefined : true })}
          />
          {projects.length === 0 ? (
            <p className="py-1 text-xs text-slate-500 dark:text-slate-400">No projects have been created yet.</p>
          ) : (
            <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
              {projects.map((project) => (
                <CheckboxItem
                  key={project.id}
                  label={project.code ? `${project.name} (${project.code})` : project.name}
                  checked={(draft.projectId ?? []).includes(project.id)}
                  onChange={() => toggleValue("projectId", project.id)}
                />
              ))}
            </div>
          )}
        </FilterGroup>

        {/* 16. Location */}
        <FilterGroup title="Location" count={count(draft.division) + count(draft.district)}>
          <div className="space-y-1">
            <FieldLabel htmlFor={`${uid}-division`}>Division</FieldLabel>
            <Select
              id={`${uid}-division`}
              options={divisionOptions}
              value={selectedDivision}
              onChange={(event) => handleDivisionChange(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <FieldLabel htmlFor={`${uid}-district`}>District</FieldLabel>
            <Select
              id={`${uid}-district`}
              options={districtOptions}
              value={selectedDistrict}
              onChange={(event) => setDraft({ district: event.target.value ? [event.target.value] : undefined })}
            />
          </div>
        </FilterGroup>
      </div>

      {/* Sticky footer — the only two commands in the panel */}
      <div className="space-y-2 border-t border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-[#111c38]">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>
            {activeCount} filter{activeCount === 1 ? "" : "s"} active
          </span>
          {typeof resultCount === "number" && (
            <span>
              {resultCount.toLocaleString()} result{resultCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={apply}
            isLoading={loading}
            leftIcon={<Search className="h-4 w-4" />}
            className="h-10 flex-1 rounded-xl bg-[#1657FF] text-sm font-bold text-white hover:bg-blue-700"
          >
            Search
          </Button>
          <Button
            variant="ghost"
            onClick={reset}
            leftIcon={<RotateCcw className="h-4 w-4" />}
            className="h-10 rounded-xl text-sm font-bold"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
