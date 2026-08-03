export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },
  EMPLOYEES: {
    LIST: "/employees",
    DETAIL: (id: string) => `/employees/${id}`,
    CREATE: "/employees",
    UPDATE: (id: string) => `/employees/${id}`,
    DELETE: (id: string) => `/employees/${id}`,
  },
  CV: {
    UPLOAD: "/cv/upload",
    EXTRACT: (id: string) => `/cv/${id}/extract`,
    STATUS: (id: string) => `/cv/${id}/status`,
    SAVE: "/cv/save",
  },
  REPORTS: {
    SUMMARY: "/reports/summary",
    DEPARTMENT_STATS: "/reports/departments",
    EXPORT_EXCEL: "/reports/export/excel",
    EXPORT_PDF: "/reports/export/pdf",
  },
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    UPDATE: (id: string) => `/users/${id}`,
  },
} as const;
