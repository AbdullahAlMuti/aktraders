import {
  LayoutDashboard,
  UploadCloud,
  Users,
  UserCheck,
  Building2,
  BarChart3,
  Settings,
  ShieldCheck,
  HelpCircle,
  FolderKanban,
  ShoppingBag,
} from "lucide-react";
import { ROUTES } from "./routes";

export interface NavItem {
  title: string;
  titleBn: string;
  href: string;
  icon: any;
  badge?: string;
  roles?: string[];
  children?: NavItem[];
}

export const MAIN_NAVIGATION: NavItem[] = [
  {
    title: "Dashboard",
    titleBn: "ড্যাশবোর্ড",
    href: ROUTES.DASHBOARD.HOME,
    icon: LayoutDashboard,
  },
  {
    title: "CV Upload",
    titleBn: "সিডি আপলোড",
    href: ROUTES.DASHBOARD.CV_UPLOAD,
    icon: UploadCloud,
    badge: "AI",
  },
  {
    title: "Employee List",
    titleBn: "এমপ্লয়ী তালিকা",
    href: ROUTES.DASHBOARD.EMPLOYEES,
    icon: Users,
  },
  {
    title: "Reports",
    titleBn: "রিপোর্ট",
    href: ROUTES.DASHBOARD.REPORTS,
    icon: BarChart3,
  },
  {
    title: "User Management",
    titleBn: "ব্যবহারকারী",
    href: ROUTES.ADMIN.USERS,
    icon: ShieldCheck,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Customers",
    titleBn: "গ্রাহকগণ",
    href: ROUTES.MODULES.CUSTOMERS,
    icon: UserCheck,
  },
  {
    title: "Products",
    titleBn: "পণ্যসমূহ",
    href: ROUTES.MODULES.PRODUCTS,
    icon: ShoppingBag,
  },
  {
    title: "Settings",
    titleBn: "সেটিংস",
    href: ROUTES.DASHBOARD.SETTINGS,
    icon: Settings,
  },
  {
    title: "Help Center",
    titleBn: "সাহায্য কেন্দ্র",
    href: ROUTES.DASHBOARD.HELP,
    icon: HelpCircle,
  },
];
