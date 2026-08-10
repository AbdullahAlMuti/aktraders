"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Tags, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { candidateService } from "@/services/candidate.service";
import { toast } from "@/hooks/use-toast";
import {
  AVAILABILITIES,
  BULK_ASSIGNABLE_FIELDS,
  MANPOWER_CATEGORIES,
  SECTORS,
  SHIFTS,
  WORK_TYPES,
  type BulkAssignableField,
  type FilterOption,
} from "@/constants/candidate-filters";
import type { BulkAssignPayload, Project } from "@/types/candidate-search.types";

/**
 * Sets the six operational columns on the selected candidates.
 *
 * Each field is tri-state, and the middle state is the point of the whole form:
 * "Leave unchanged" is omitted from the payload so the column keeps its current
 * value, while "Clear" sends an explicit null so the column is emptied. Sending
 * null for an untouched field would wipe data the user never looked at.
 */

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  projects: Project[];
  onAssigned: () => void;
}

const UNCHANGED = "__unchanged__";
const CLEAR = "__clear__";

/** Above this many rows the change is large enough to be worth confirming. */
const CONFIRM_THRESHOLD = 50;

const FIELDS: ReadonlyArray<{
  field: BulkAssignableField;
  label: string;
  clearLabel: string;
  options: readonly FilterOption[] | null;
}> = [
  { field: "manpower_category", label: "Job Category", clearLabel: "Clear category", options: MANPOWER_CATEGORIES },
  { field: "work_type", label: "Work Type", clearLabel: "Clear work type", options: WORK_TYPES },
  { field: "shift", label: "Shift", clearLabel: "Clear shift", options: SHIFTS },
  { field: "availability", label: "Employment Status", clearLabel: "Clear status", options: AVAILABILITIES },
  { field: "sector", label: "Government / Private", clearLabel: "Clear sector", options: SECTORS },
  // Projects are data, not an enum, so their options come from the caller.
  { field: "project_id", label: "Project", clearLabel: "Clear project (unassign)", options: null },
];

const initialValues = (): Record<BulkAssignableField, string> =>
  Object.fromEntries(BULK_ASSIGNABLE_FIELDS.map((field) => [field, UNCHANGED])) as Record<
    BulkAssignableField,
    string
  >;

export function BulkAssignModal({ isOpen, onClose, selectedIds, projects, onAssigned }: BulkAssignModalProps) {
  const [values, setValues] = useState<Record<BulkAssignableField, string>>(initialValues);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [confirming, setConfirming] = useState<boolean>(false);
  const uid = useId();

  // Every opening starts from a clean form; a leftover selection from the last
  // batch is exactly the kind of thing that gets applied by accident.
  useEffect(() => {
    if (isOpen) {
      setValues(initialValues());
      setConfirming(false);
    }
  }, [isOpen]);

  const projectOptions = useMemo<readonly FilterOption[]>(
    () => projects.map((project) => ({ value: project.id, label: project.code ? `${project.name} (${project.code})` : project.name })),
    [projects]
  );

  const changedCount = BULK_ASSIGNABLE_FIELDS.filter((field) => values[field] !== UNCHANGED).length;
  const needsConfirm = selectedIds.length > CONFIRM_THRESHOLD;

  if (!isOpen) return null;

  const buildFields = (): BulkAssignPayload["fields"] => {
    const fields: Record<string, string | null> = {};
    for (const field of BULK_ASSIGNABLE_FIELDS) {
      const value = values[field];
      if (value === UNCHANGED) continue; // omitted — the column is left alone
      fields[field] = value === CLEAR ? null : value; // null — the column is emptied
    }
    // Every value came out of the canonical option lists above, and the route
    // validates them again against ALLOWED_VALUES before writing.
    return fields as BulkAssignPayload["fields"];
  };

  const handleApply = async () => {
    if (selectedIds.length === 0) {
      toast.warning("No candidates selected", "Select at least one row before assigning.");
      return;
    }
    if (changedCount === 0) {
      toast.warning("Nothing to apply", "Choose a value for at least one field.");
      return;
    }
    if (needsConfirm && !confirming) {
      setConfirming(true);
      return;
    }

    setSubmitting(true);
    try {
      const response = await candidateService.bulkAssign({ ids: selectedIds, fields: buildFields() });
      if (response.success) {
        toast.success(
          "Assignment saved",
          `Updated ${response.updated} candidate record${response.updated === 1 ? "" : "s"}.`
        );
        onAssigned();
      } else {
        toast.error("Assignment failed", response.error);
      }
    } catch {
      toast.error("Assignment error", "An unexpected error occurred while assigning.");
    } finally {
      setSubmitting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#111c38]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-950/60">
              <Tags className="h-5 w-5 text-[#1657FF] dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Bulk Assign</h3>
              <p className="mt-0.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                Assigning to {selectedIds.length.toLocaleString()} candidate
                {selectedIds.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={submitting} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Fields */}
        <div className="max-h-[55vh] space-y-3 overflow-y-auto py-4">
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Fields left on <strong className="font-bold text-slate-600 dark:text-slate-300">Leave unchanged</strong> are
            not written at all. Choose <strong className="font-bold text-slate-600 dark:text-slate-300">Clear</strong> to
            empty a field.
          </p>

          {FIELDS.map(({ field, label, clearLabel, options }) => {
            const fieldOptions = options ?? projectOptions;
            const selectId = `${uid}-${field}`;
            return (
              <div key={field} className="space-y-1">
                <label htmlFor={selectId} className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  {label}
                </label>
                <Select
                  id={selectId}
                  value={values[field]}
                  disabled={submitting}
                  onChange={(event) => setValues((prev) => ({ ...prev, [field]: event.target.value }))}
                  options={[
                    { value: UNCHANGED, label: "Leave unchanged" },
                    { value: CLEAR, label: clearLabel },
                    ...fieldOptions.map((option) => ({ value: option.value, label: option.label })),
                  ]}
                />
                {field === "project_id" && projects.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No projects have been created yet — only clearing is available.
                  </p>
                )}
              </div>
            );
          })}

          {confirming && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/30">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-xs font-bold leading-relaxed text-amber-900 dark:text-amber-200">
                This writes {changedCount} field{changedCount === 1 ? "" : "s"} to{" "}
                {selectedIds.length.toLocaleString()} candidate records at once. Press Apply again to confirm.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={submitting} className="rounded-xl font-semibold">
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={submitting || changedCount === 0}
            leftIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tags className="h-4 w-4" />}
            className="rounded-xl bg-[#1657FF] font-bold text-white hover:bg-blue-700"
          >
            {submitting
              ? "Assigning…"
              : confirming
              ? `Confirm — assign ${selectedIds.length.toLocaleString()}`
              : `Apply to ${selectedIds.length.toLocaleString()}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
