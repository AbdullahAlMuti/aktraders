"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Shield, LogIn, ShieldAlert } from "lucide-react";
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

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      router.push("/");
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white p-8 md:p-10 shadow-xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 space-y-6">
      {/* Top Lock Icon Badge & Title Header */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Admin Login
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Please sign in to continue
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Admin Login Form */}
      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
          error={loginForm.formState.errors.email?.message}
          {...loginForm.register("email")}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          error={loginForm.formState.errors.password?.message}
          {...loginForm.register("password")}
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              {...loginForm.register("rememberMe")}
            />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Remember me</span>
          </label>
          <a href="#" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
            Forgot Password?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#1657FF] hover:bg-blue-700 h-11 text-sm font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20"
          isLoading={loading}
        >
          <LogIn className="h-4 w-4" />
          <span>Login</span>
        </Button>
      </form>

      {/* Bottom Security Notice */}
      <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 pt-2">
        <Shield className="h-3.5 w-3.5" />
        <span>This is a secure system. Unauthorized access is prohibited.</span>
      </div>
    </div>
  );
}
