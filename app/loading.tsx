import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Spinner size="xl" label="সিস্টেম লোড হচ্ছে... (Loading AK Traders ERP)" />
    </div>
  );
}
