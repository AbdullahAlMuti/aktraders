"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable, Column } from "@/components/shared/DataTable";
import { EmployeeFilterBar } from "./EmployeeFilterBar";
import { EmployeeDetailDrawer } from "./EmployeeDetailDrawer";
import { employeeService } from "@/services/employee.service";
import { Employee } from "@/types/employee.types";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useFilterStore } from "@/stores/use-filter-store";
import { Eye, Download, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export function EmployeeList() {
  const { searchQuery, departmentFilter, statusFilter, page, setPage } = useFilterStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeService.getEmployees({
        search: searchQuery,
        department: departmentFilter,
        status: statusFilter as any,
        page,
        limit: 10,
      });
      setEmployees(res.data);
      setTotalPages(res.meta.totalPages);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, departmentFilter, statusFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isAllSelected = employees.length > 0 && employees.every((e) => selectedIds.includes(e.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map((e) => e.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    setIsDeleting(true);
    try {
      const success = await employeeService.deleteEmployee(employeeToDelete.id);
      if (success) {
        toast.success("Employee Deleted", `Successfully removed ${employeeToDelete.name} from the system.`);
        setSelectedIds((prev) => prev.filter((id) => id !== employeeToDelete.id));
        await fetchData();
      } else {
        toast.error("Delete Failed", "Could not delete employee record from database.");
      }
    } catch (err) {
      toast.error("Delete Error", "An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
      setEmployeeToDelete(null);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const count = selectedIds.length;
      const success = await employeeService.deleteMultipleEmployees(selectedIds);
      if (success) {
        toast.success("Bulk Delete Complete", `Successfully deleted ${count} employee record(s).`);
        setSelectedIds([]);
        await fetchData();
      } else {
        toast.error("Bulk Delete Failed", "Could not remove selected records from database.");
      }
    } catch (err) {
      toast.error("Delete Error", "An error occurred during bulk deletion.");
    } finally {
      setIsDeleting(false);
      setShowBulkDeleteModal(false);
    }
  };

  const handleExportCSV = () => {
    if (employees.length === 0) {
      toast.warning("No Data", "No employee records to export");
      return;
    }

    const headers = ["Employee ID", "Name", "Email", "Phone", "Department", "Designation", "Status", "Joining Date"];
    const rows = employees.map((e) => [
      e.id,
      `"${e.name}"`,
      `"${e.email}"`,
      `"${e.phone || ""}"`,
      `"${e.department}"`,
      `"${e.designation}"`,
      `"${e.status}"`,
      `"${e.joiningDate || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employees_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV Export Complete", `Exported ${employees.length} employee records`);
  };

  const columns: Column<Employee>[] = [
    {
      header: (
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={handleSelectAll}
          className="h-4 w-4 rounded border-slate-300 text-[#0066ff] focus:ring-[#0066ff] cursor-pointer"
          title="Select / Deselect All"
        />
      ),
      cell: (item) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(item.id)}
          onChange={() => handleSelectRow(item.id)}
          className="h-4 w-4 rounded border-slate-300 text-[#0066ff] focus:ring-[#0066ff] cursor-pointer"
        />
      ),
      className: "w-10 px-2 text-center",
    },
    {
      header: "Employee ID",
      accessorKey: "employeeId",
      cell: (item) => <span className="font-mono text-sm font-bold text-[#0066ff] dark:text-blue-400">{item.employeeId || item.id}</span>,
    },
    {
      header: "Employee Name",
      cell: (item) => (
        <Link href={`/employees/${item.id}`}>
          <div className="flex items-center space-x-3 cursor-pointer group">
            <Avatar src={item.avatarUrl} name={item.name} size="md" />
            <div>
              <p className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-[#0066ff] transition-colors">{item.name}</p>
              <p className="text-xs text-slate-500 font-medium">{item.email}</p>
            </div>
          </div>
        </Link>
      ),
    },
    {
      header: "Department",
      accessorKey: "department",
      cell: (item) => <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.department}</span>,
    },
    {
      header: "Designation",
      accessorKey: "designation",
      cell: (item) => <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.designation}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item) => (
        <Badge
          variant={
            item.status === "active"
              ? "success"
              : item.status === "processing" || item.status === "review_required"
              ? "warning"
              : "secondary"
          }
        >
          {item.status === "active"
            ? "Active"
            : item.status === "processing"
            ? "Processing"
            : item.status === "review_required"
            ? "Needs Review"
            : "Pending"}
        </Badge>
      ),
    },
    {
      header: "Joining Date",
      accessorKey: "joiningDate",
      cell: (item) => <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">{item.joiningDate}</span>,
    },
    {
      header: "Actions",
      cell: (item) => (
        <div className="flex items-center space-x-1 justify-end">
          <Link href={`/employees/${item.id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-500 hover:text-[#0066ff]"
              title="View Universal Employee Profile"
            >
              <Eye className="h-5 w-5" />
            </Button>
          </Link>
          {item.cvData?.originalPdfUrl ? (
            <a
              href={item.cvData.originalPdfUrl}
              download={item.cvFileName || `${item.name.replace(/\s+/g, "_")}_CV.pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-500 hover:text-emerald-600"
                title="Download Candidate CV PDF"
              >
                <Download className="h-5 w-5" />
              </Button>
            </a>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              disabled
              className="h-9 w-9 text-slate-300 dark:text-slate-700"
              title="No PDF file available"
            >
              <Download className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEmployeeToDelete(item)}
            className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Delete Employee"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <EmployeeFilterBar onExportCSV={handleExportCSV} />

      {/* Bulk Selection Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-bold text-rose-900 dark:text-rose-200 shadow-sm animate-fadeIn">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-extrabold text-xs">
              {selectedIds.length} Selected
            </span>
            <span>{selectedIds.length === 1 ? "1 employee record selected" : `${selectedIds.length} employee records selected`}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="text-xs font-semibold rounded-xl border-rose-200 dark:border-rose-800"
            >
              Clear Selection
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteModal(true)}
              leftIcon={<Trash2 className="h-4 w-4" />}
              className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
            >
              Delete Selected ({selectedIds.length})
            </Button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={employees}
        isLoading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Slide-Over Detail Drawer */}
      <EmployeeDetailDrawer
        employee={selectedEmployee}
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />

      {/* Confirmation Modal for Deleting Single Employee */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111c38] shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-950/60">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Delete Employee Record</h3>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{employeeToDelete.name}</strong> ({employeeToDelete.id})? This will permanently remove their profile and CV records from the database.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setEmployeeToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                leftIcon={isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Bulk Deleting Employees */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111c38] shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-950/60">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Bulk Delete {selectedIds.length} Employees</h3>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-rose-600 dark:text-rose-400">{selectedIds.length} selected employee profile(s)</strong>? This will permanently remove their records and CV files from the database.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-xl font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDeleteConfirm}
                disabled={isDeleting}
                leftIcon={isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isDeleting ? "Deleting All..." : `Delete ${selectedIds.length} Records`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
