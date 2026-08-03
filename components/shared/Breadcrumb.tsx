import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 py-2">
      <Link href="/" className="flex items-center hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          {item.href ? (
            <Link href={item.href} className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-slate-900 dark:text-slate-100">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
