import { AuthLayout as SharedAuthLayout } from "@/components/layouts/AuthLayout";

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <SharedAuthLayout>{children}</SharedAuthLayout>;
}
