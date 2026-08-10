import {
  LayoutDashboard,
  UploadCloud,
  Users,
  UserCheck,
  BarChart3,
  Building2,
  User,
} from "lucide-react";
import { ROUTES } from "./routes";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  roles?: string[];
  children?: NavItem[];
}

export const MAIN_NAVIGATION: NavItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.DASHBOARD.HOME,
    icon: LayoutDashboard,
  },
  {
    title: "CV Upload",
    href: ROUTES.DASHBOARD.CV_UPLOAD,
    icon: UploadCloud,
    badge: "AI",
  },
  {
    title: "Candidate Directory",
    href: ROUTES.DASHBOARD.EMPLOYEES,
    icon: Users,
  },
  {
    title: "Employee Profile",
    href: "/employee-profile",
    icon: User,
  },
  {
    title: "Departments",
    href: "/departments",
    icon: Building2,
  },
  {
    title: "Reports & Analytics",
    href: ROUTES.DASHBOARD.REPORTS,
    icon: BarChart3,
  },
];
