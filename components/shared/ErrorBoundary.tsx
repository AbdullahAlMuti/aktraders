"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component tree:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            একটি অপ্রত্যাশিত ত্রুটি ঘটেছে (An error occurred)
          </h2>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 max-w-md">
            {this.state.error?.message || "পেজটি পুনরায় লোড করার চেষ্টা করুন।"}
          </p>
          <Button onClick={this.handleReset} className="mt-6" variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />}>
            পেজ রিফ্রেশ করুন (Refresh Page)
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
