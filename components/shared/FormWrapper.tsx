import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface FormWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  isLoading?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;
  className?: string;
}

export function FormWrapper({
  title,
  description,
  children,
  onSubmit,
  submitLabel = "সংরক্ষণ করুন (Save)",
  isLoading = false,
  cancelLabel,
  onCancel,
  className,
}: FormWrapperProps) {
  return (
    <Card className={className}>
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
        <CardFooter className="flex justify-end space-x-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              {cancelLabel || "বাতিল (Cancel)"}
            </Button>
          )}
          <Button type="submit" isLoading={isLoading}>
            {submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
