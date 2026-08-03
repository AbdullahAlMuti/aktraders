# AK Traders Limited - Enterprise Frontend Architecture Guidelines

Welcome to the enterprise frontend codebase for **A K Traders Limited** (Employee Database Management System & Enterprise Resource Planning). This repository follows modern scalable frontend practices designed for enterprise SaaS applications.

---

## 🏗️ Technology Stack

| Domain | Framework / Library | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | Next.js 14+ (App Router) | React Server Components, File-system Routing, Optimization |
| **Language** | TypeScript | Strict type safety, interface contracts |
| **Styling** | Tailwind CSS + CSS Variables | Design tokens, dark/light themes, responsive layout |
| **UI Primitives** | Radix UI / Shadcn patterns | Accessible, unstyled UI primitives |
| **Forms** | React Hook Form | Performant form state management |
| **Validation** | Zod | Schema validation for forms and API data |
| **State Management**| Zustand | Lightweight client & UI global state |
| **Data Fetching** | TanStack Query (v5) + Axios | Server state cache, polling, auto-revalidation |
| **Iconography** | Lucide React | Modern, lightweight icons |

---

## 📁 Directory Structure & Architecture

```
d:\eBay Software\AK Traders
├── app/                  # Next.js App Router Pages & API Routes
│   ├── (auth)/           # Authentication layout & pages
│   ├── (dashboard)/      # Main ERP Dashboard, CV Upload, Employees, Reports
│   ├── (admin)/          # Admin & System User Control
│   ├── api/              # Route handlers (Health, Mock Proxy)
│   ├── globals.css       # Design tokens & Tailwind imports
│   └── layout.tsx        # Root HTML layout with providers
├── components/           # Global Shared UI Components
│   ├── ui/               # Atomic Primitives (Button, Input, Card, Badge, Table, Modal)
│   ├── shared/           # Cross-cutting UI (Header, Sidebar, DataTable, ErrorBoundary)
│   └── layouts/          # Reusable Layout templates (DashboardLayout, AuthLayout)
├── features/             # Business Domain Modules (Feature-Sliced Architecture)
│   ├── authentication/   # Login forms, auth hooks & schemas
│   ├── dashboard/        # Stats cards, trend charts, activity feed
│   ├── cv-upload/        # 4-Step AI CV upload wizard
│   ├── employees/        # Directory tables, filters, employee drawers
│   ├── reports/          # Detailed report matrix, export handlers
│   ├── users/            # System user administration
│   ├── customers/        # Customer registry module
│   └── products/         # Product catalog module
├── hooks/                # Custom React Hooks (useAuth, useDebounce, usePagination)
├── services/             # API Integration Layer (api-client, auth.service, cv.service)
├── stores/               # Zustand Global State Stores (auth, ui, filters)
├── types/                # TypeScript Interfaces & Contract Definitions
├── utils/                # Utility Helper Functions (cn, formatters, error-handler)
├── constants/            # Routes, Navigation, and APP_CONFIG constants
├── config/               # Site, Environment, and Theme Configurations
└── lib/                  # Library initializations (axios, react-query, utils)
```

---

## 🔑 Key Architectural Conventions

### 1. Component & Module Scoping
- **`components/ui/`**: Pure design system components with no domain business logic.
- **`features/[domain]/`**: Encapsulate domain-specific state, components, and forms within their respective feature folders.
- **`services/`**: Centralize HTTP requests using the standardized `api` wrapper in `services/api-client.ts`.

### 2. State Management Rules
- **Server State**: Managed via TanStack Query (`useQuery`, `useMutation`). Avoid duplicating server data in local state.
- **Global UI State**: Managed via Zustand (`stores/use-ui-store.ts`, `stores/use-auth-store.ts`).
- **Form State**: Managed via React Hook Form with Zod schemas from `utils/validators.ts`.

### 3. API & Error Handling Standard
- All API requests use `apiClient` (`lib/axios.ts`), which automatically attaches JWT bearer tokens and handles `401 Unauthorized` redirects.
- All unexpected errors are caught globally by `utils/error-handler.ts` and rendered smoothly via `components/shared/ErrorBoundary.tsx`.

---

## 🎨 Design System & Theme Support

- Colors utilize Tailwind CSS variables supporting both **Light** and **Dark** mode.
- Primary Brand Blue: `#1657FF` / `#1E6091`
- Sidebar Dark Navy: `#04122E` / `#021438`
- Fully responsive across Desktop, Tablet, and Mobile viewports.
