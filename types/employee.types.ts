export type EmployeeStatus = "active" | "processing" | "pending" | "inactive";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: EmployeeStatus;
  joiningDate: string;
  cvFileName?: string;
  cvFileSize?: string;
  avatarUrl?: string;
}

export interface EmployeeFilterState {
  department?: string;
  status?: EmployeeStatus;
  search?: string;
  dateRange?: {
    from?: string;
    to?: string;
  };
}
