"use client";

import { useState, useEffect } from "react";
import { DataTable, Column } from "@/components/shared/DataTable";
import { EmployeeFilterBar } from "./EmployeeFilterBar";
import { EmployeeDetailDrawer } from "./EmployeeDetailDrawer";
import { employeeService } from "@/services/employee.service";
import { Employee } from "@/types/employee.types";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useFilterStore } from "@/stores/use-filter-store";
import { Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export function EmployeeList() {
  const { searchQuery, departmentFilter, statusFilter, page, setPage } = useFilterStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    async function fetchData() {
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
    }
    fetchData();
  }, [searchQuery, departmentFilter, statusFilter, page]);

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
      header: "Employee ID",
      accessorKey: "id",
      cell: (item) => <span className="font-mono text-sm font-bold text-[#0066ff] dark:text-blue-400">{item.id}</span>,
    },
    {
      header: "Employee Name",
      cell: (item) => (
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setSelectedEmployee(item)}>
          <Avatar name={item.name} size="md" />
          <div>
            <p className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-[#0066ff] transition-colors">{item.name}</p>
            <p className="text-xs text-slate-500 font-medium">{item.email}</p>
          </div>
        </div>
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
              : item.status === "processing"
              ? "warning"
              : "secondary"
          }
        >
          {item.status === "active" ? "Active" : item.status === "processing" ? "Processing" : "Pending"}
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
          <Link href={`/cv-upload/${item.id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-500 hover:text-[#0066ff]"
              title="Preview Original PDF & Complete CV"
            >
              <Eye className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportCSV}
            className="h-9 w-9 text-slate-500 hover:text-emerald-600"
            title="Export Records"
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <EmployeeFilterBar onExportCSV={handleExportCSV} />
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
    </div>
  );
}
