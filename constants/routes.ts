export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
    FORGOT_PASSWORD: "/forgot-password",
  },
  DASHBOARD: {
    HOME: "/",
    CV_UPLOAD: "/cv-upload",
    EMPLOYEES: "/employees",
    REPORTS: "/reports",
    SETTINGS: "/settings",
    HELP: "/help",
  },
  ADMIN: {
    USERS: "/admin/users",
    ROLES: "/admin/roles",
    SYSTEM_LOGS: "/admin/logs",
  },
  MODULES: {
    CUSTOMERS: "/customers",
    PRODUCTS: "/products",
  },
} as const;
