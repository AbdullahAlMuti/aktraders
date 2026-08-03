import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
      <h1 className="text-8xl font-black text-blue-600 dark:text-blue-500">404</h1>
      <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">
        পৃষ্ঠাটি পাওয়া যায়নি (Page Not Found)
      </h2>
      <p className="mt-2 text-xs text-slate-500 max-w-sm">
        আপনি যে পৃষ্ঠাটি খুঁজছেন তা মুছে ফেলা হয়েছে বা ইউআরএল সঠিক নয়।
      </p>
      <Link href="/" className="mt-6">
        <Button leftIcon={<Home className="h-4 w-4" />}>ড্যাশবোর্ডে ফিরুন (Back to Dashboard)</Button>
      </Link>
    </div>
  );
}
