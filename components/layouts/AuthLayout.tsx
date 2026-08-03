import * as React from "react";
import { Shield, UploadCloud, Search } from "lucide-react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-slate-100 dark:bg-slate-950">
      {/* Left Branding Hero Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-[#021438] via-[#0A2540] to-[#04122E] p-12 text-white relative overflow-hidden">
        {/* Background Accent Graphics */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Brand Header */}
        <div className="flex items-center space-x-3 z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white font-black text-[#0A2540] text-xl shadow-lg">
            AK
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-wider uppercase">A K TRADERS</h2>
            <p className="text-xs text-blue-300 font-medium">LIMITED &gt;</p>
          </div>
        </div>

        {/* Hero Content */}
        <div className="my-auto max-w-lg z-10 space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest">Welcome to</p>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Employee Database Management System
            </h1>
            <div className="h-1 w-16 bg-blue-500 rounded-full mt-3" />
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Securely upload, manage and organize employee CVs in one centralized AI-powered enterprise system.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6">
            <div className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <div className="p-2.5 rounded-lg bg-blue-600/30 text-blue-300 mb-2">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white">Secure Access</span>
              <span className="text-[10px] text-slate-400 mt-1">Protected data</span>
            </div>

            <div className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <div className="p-2.5 rounded-lg bg-cyan-600/30 text-cyan-300 mb-2">
                <UploadCloud className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white">Easy Upload</span>
              <span className="text-[10px] text-slate-400 mt-1">AI parsing</span>
            </div>

            <div className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <div className="p-2.5 rounded-lg bg-emerald-600/30 text-emerald-300 mb-2">
                <Search className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white">Quick Search</span>
              <span className="text-[10px] text-slate-400 mt-1">Instant query</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-400 z-10">
          © 2026 A K Traders Limited. All rights reserved.
        </div>
      </div>

      {/* Right Login Card Panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
