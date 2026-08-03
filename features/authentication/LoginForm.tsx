"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { emailSchema, passwordSchema } from "@/utils/validators";

const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "admin@aktraders.com",
      password: "password123",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      router.push("/");
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white p-8 shadow-xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 space-y-6">
      {/* Icon & Title Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Login</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Please sign in to continue to system</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              {...register("rememberMe")}
            />
            <span className="text-slate-600 dark:text-slate-400">Remember me</span>
          </label>
          <a href="#" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
            Forgot Password?
          </a>
        </div>

        <Button type="submit" className="w-full bg-[#1657FF] hover:bg-blue-700 h-11 text-base font-semibold" isLoading={loading}>
          Login
        </Button>
      </form>

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        <span className="absolute bg-white px-3 text-[10px] uppercase text-slate-400 dark:bg-slate-900">or</span>
      </div>

      <button className="flex w-full items-center justify-center space-x-2 rounded-lg border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
        <ShieldCheck className="h-4 w-4 text-blue-600" />
        <span>Secure Admin Access</span>
      </button>

      <p className="text-[10px] text-center text-slate-400">
        This is a secure system. Unauthorized access is prohibited.
      </p>
    </div>
  );
}
