import * as React from "react";
import { Breadcrumb, BreadcrumbItem } from "@/components/shared/Breadcrumb";
import { cn } from "@/utils/cn";

export interface PageContainerProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn("space-y-6 pb-12 animate-page-entry", className)}>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center space-x-3">{actions}</div>}
      </div>

      <div>{children}</div>
    </div>
  );
}
