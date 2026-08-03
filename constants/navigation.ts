import {
  LayoutDashboard,
  UploadCloud,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  ShieldCheck,
  HelpCircle,
  ShoppingBag,
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
    title: "Employee Directory",
    href: ROUTES.DASHBOARD.EMPLOYEES,
    icon: Users,
  },
  {
    title: "Employee Profile",
    href: "/profile",
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
  {
    title: "User Management",
    href: ROUTES.ADMIN.USERS,
    icon: ShieldCheck,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Customers",
    href: ROUTES.MODULES.CUSTOMERS,
    icon: UserCheck,
  },
  {
    title: "Product Catalog",
    href: ROUTES.MODULES.PRODUCTS,
    icon: ShoppingBag,
  },
  {
    title: "System Settings",
    href: ROUTES.DASHBOARD.SETTINGS,
    icon: Settings,
  },
  {
    title: "Help Center",
    href: ROUTES.DASHBOARD.HELP,
    icon: HelpCircle,
  },
];
