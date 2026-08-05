import * as React from "react";
import Image from "next/image";
import { Shield, UploadCloud, Search } from "lucide-react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Branding Hero Panel with Full View Background Image */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-12 text-white relative overflow-hidden bg-[#041a54]">
        {/* Full View Background Image */}
        <Image
          src="/images/hero-illustration.jpg"
          alt="Employee Database Management System Background"
          fill
          priority
          className="object-cover object-center z-0"
        />

        {/* Dark Blue Overlay Gradient for High Contrast Text */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#021442]/90 via-[#041f69]/80 to-[#020e2e]/95 z-[1]" />

        {/* Background Accent Ornaments */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl z-[2]" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl z-[2]" />

        {/* Dot pattern grid top right */}
        <div className="absolute top-8 right-12 grid grid-cols-5 gap-2 opacity-25 pointer-events-none z-[2]">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
          ))}
        </div>

        {/* Brand Header */}
        <div className="flex items-center space-x-3 z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-black text-[#041f69] text-sm shadow-md tracking-tighter">
            AK
          </div>
          <div>
            <h2 className="text-base font-bold tracking-wide leading-tight drop-shadow">A K TRADERS</h2>
            <p className="text-[11px] text-blue-200 font-medium tracking-wider">LIMITED &gt;</p>
          </div>
        </div>

        {/* Hero Content */}
        <div className="my-auto z-10 space-y-6 max-w-lg mx-auto w-full">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-blue-300 uppercase tracking-widest">Welcome to</p>
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-md">
              Employee Database <br /> Management System
            </h1>
            <div className="h-1.5 w-16 bg-blue-400 rounded-full mt-4 shadow-sm" />
          </div>

          <p className="text-sm xl:text-base text-slate-200 leading-relaxed font-normal drop-shadow">
            Securely upload, manage and organize employee CVs in one centralized system.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6">
            <div className="flex flex-col items-center p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-center shadow-lg hover:bg-white/15 transition-all">
              <div className="p-2.5 rounded-xl bg-blue-500/30 text-blue-200 mb-2">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white">Secure Access</span>
              <span className="text-[10px] text-slate-200/90 mt-1 leading-tight">Your data is safe and protected</span>
            </div>

            <div className="flex flex-col items-center p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-center shadow-lg hover:bg-white/15 transition-all">
              <div className="p-2.5 rounded-lg bg-blue-500/30 text-blue-200 mb-2">
                <UploadCloud className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white">Easy Upload</span>
              <span className="text-[10px] text-slate-200/90 mt-1 leading-tight">Upload employee CVs easily</span>
            </div>

            <div className="flex flex-col items-center p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-center shadow-lg hover:bg-white/15 transition-all">
              <div className="p-2.5 rounded-lg bg-blue-500/30 text-blue-200 mb-2">
                <Search className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white">Quick Search</span>
              <span className="text-[10px] text-slate-200/90 mt-1 leading-tight">Find and manage CVs instantly</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-300/80 z-10 font-medium">
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
