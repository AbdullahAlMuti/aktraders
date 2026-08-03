"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, User as UserIcon, Building, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { emailSchema, passwordSchema } from "@/utils/validators";
import { UserRole } from "@/types/auth.types";

const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
});

const signUpFormSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["admin", "hr", "manager", "employee"]),
  department: z.string().min(1, "Department is required"),
});

type LoginFormData = z.infer<typeof loginFormSchema>;
type SignUpFormData = z.infer<typeof signUpFormSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login, signUp, loading, error } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "employee",
      department: "Sales",
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setSuccessMessage(null);
    try {
      await login(data);
      router.push("/");
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const onSignUpSubmit = async (data: SignUpFormData) => {
    setSuccessMessage(null);
    try {
      await signUp(data);
      setSuccessMessage("Account created successfully and saved in database!");
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err) {
      console.error("Sign up failed", err);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white p-8 shadow-xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 space-y-6">
      {/* Header & Icon */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {mode === "login"
            ? "Sign in to access AK Traders management system"
            : "Register your account & persist details in Supabase DB"}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => { setMode("login"); setSuccessMessage(null); }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
            mode === "login"
              ? "bg-white text-blue-600 shadow dark:bg-slate-900 dark:text-blue-400"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode("signup"); setSuccessMessage(null); }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
            mode === "signup"
              ? "bg-white text-blue-600 shadow dark:bg-slate-900 dark:text-blue-400"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Sign Up
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-3 text-xs text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-200 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Login Form */}
      {mode === "login" && (
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={loginForm.formState.errors.email?.message}
            {...loginForm.register("email")}
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
            error={loginForm.formState.errors.password?.message}
            {...loginForm.register("password")}
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                {...loginForm.register("rememberMe")}
              />
              <span className="text-slate-600 dark:text-slate-400">Remember me</span>
            </label>
            <a href="#" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Forgot Password?
            </a>
          </div>

          <Button type="submit" className="w-full bg-[#1657FF] hover:bg-blue-700 h-11 text-base font-semibold" isLoading={loading}>
            Sign In
          </Button>
        </form>
      )}

      {/* Sign Up Form */}
      {mode === "signup" && (
        <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter full name"
            leftIcon={<UserIcon className="h-4 w-4" />}
            error={signUpForm.formState.errors.name?.message}
            {...signUpForm.register("name")}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your work email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={signUpForm.formState.errors.email?.message}
            {...signUpForm.register("email")}
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
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
            error={signUpForm.formState.errors.password?.message}
            {...signUpForm.register("password")}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Role
              </label>
              <select
                {...signUpForm.register("role")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Department
              </label>
              <select
                {...signUpForm.register("department")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="IT">IT</option>
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#1657FF] hover:bg-blue-700 h-11 text-base font-semibold" isLoading={loading}>
            Create Account & Save
          </Button>
        </form>
      )}

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        <span className="absolute bg-white px-3 text-[10px] uppercase text-slate-400 dark:bg-slate-900">or</span>
      </div>

      <p className="text-[10px] text-center text-slate-400">
        All user data is encrypted & stored dynamically in Supabase database.
      </p>
    </div>
  );
}
