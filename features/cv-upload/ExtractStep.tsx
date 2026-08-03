"use client";

import { Check, Loader2, Cpu, ArrowRight, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function ExtractStep({
  file,
  onNext,
  onBack,
}: {
  file: File | null;
  onNext: () => void;
  onBack: () => void;
}) {
  const steps = [
    { title: "ডকুমেন্ট পড়া হয়েছে", desc: "PDF থেকে টেক্সট এক্সট্র্যাক্ট করা হয়েছে", status: "completed" },
    { title: "টেক্সট বিশ্লেষণ", desc: "গুরুত্বপূর্ণ তথ্য শনাক্ত করা হয়েছে", status: "completed" },
    { title: "তথ্য শ্রেণীবিন্যাস", desc: "নাম, ঠিকানা, শিক্ষা, অভিজ্ঞতা আলাদা করা হয়েছে", status: "completed" },
    { title: "তথ্য এক্সট্র্যাক্ট হচ্ছে", desc: "স্ট্রাকচার্ড ডেটায় রূপান্তর করা হচ্ছে...", status: "active" },
    { title: "সম্পন্ন হচ্ছে", desc: "ডেটা যাচাই ও প্রস্তুত করা হচ্ছে...", status: "pending" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Extraction Progress */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            AI তথ্য এক্সট্র্যাক্ট প্রগ্রেস (AI Progress)
          </h3>

          <div className="space-y-5">
            {steps.map((s, index) => (
              <div key={index} className="flex items-start space-x-3 text-xs">
                <div className="mt-0.5">
                  {s.status === "completed" ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  ) : s.status === "active" ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white animate-spin">
                      <Loader2 className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 text-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className={`font-bold ${s.status === "pending" ? "text-slate-400" : "text-slate-900 dark:text-slate-100"}`}>
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Status Card */}
          <div className="rounded-xl bg-blue-50/70 p-4 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 dark:text-blue-200">
              <Cpu className="h-4 w-4 text-blue-600 animate-pulse" />
              <span>AI প্রসেসিং...</span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              দয়া করে অপেক্ষা করুন, এটি কিছু সময় নিতে পারে।
            </p>
            <ProgressBar value={78} showLabel />
          </div>
        </div>

        {/* Right Column: Live CV Preview Panel */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              আপলোডকৃত সিডি প্রিভিউ (CV Preview)
            </h3>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              {file?.name || "Rahim_Hasan_CV.pdf"} (3.2 MB)
            </span>
          </div>

          {/* PDF Page Mockup */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950 font-sans text-xs text-slate-800 dark:text-slate-200 space-y-4 shadow-inner max-h-[400px] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black uppercase text-slate-900 dark:text-slate-100">MD. RAHIM HASAN</h2>
                <p className="font-semibold text-slate-600 dark:text-slate-400">Senior Executive</p>
                <p className="text-[11px] text-slate-500 mt-1">📞 017XXXXXXXX | ✉️ rahim.hasan@email.com</p>
                <p className="text-[11px] text-slate-500">📍 Dhaka, Bangladesh</p>
              </div>
              <div className="h-20 w-16 bg-slate-200 rounded border flex items-center justify-center text-[10px] text-slate-400 font-bold">
                PHOTO
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold uppercase text-slate-900 dark:text-slate-100 text-[11px] border-b border-slate-200 pb-1">
                CAREER OBJECTIVE
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                To build a long-term career in a dynamic organization where I can utilize my skills and contribute to the growth of the organization.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold uppercase text-slate-900 dark:text-slate-100 text-[11px] border-b border-slate-200 pb-1">
                EDUCATION
              </h4>
              <p className="font-bold">BSc in Computer Science and Engineering (2018)</p>
              <p className="text-[11px] text-slate-500">University of Dhaka | CGPA: 3.25 out of 4.00</p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold uppercase text-slate-900 dark:text-slate-100 text-[11px] border-b border-slate-200 pb-1">
                PERSONAL INFORMATION
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><span className="text-slate-500">Father&apos;s Name:</span> Md. Karim Hasan</div>
                <div><span className="text-slate-500">Mother&apos;s Name:</span> Mrs. Salma Begum</div>
                <div><span className="text-slate-500">Date of Birth:</span> 15 January 1993</div>
                <div><span className="text-slate-500">NID No:</span> 1993123456789012</div>
              </div>
            </div>
          </div>

          {/* Viewer Toolbar */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <div className="flex items-center space-x-1">
              <button className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-800"><ChevronLeft className="h-4 w-4" /></button>
              <span>1 / 2</span>
              <button className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-800"><ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-800"><ZoomOut className="h-4 w-4" /></button>
              <span>82%</span>
              <button className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-800"><ZoomIn className="h-4 w-4" /></button>
              <button className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-800"><Download className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between rounded-xl bg-blue-50/50 p-4 border border-blue-100 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          💡 AI সমস্ত তথ্য এক্সট্র্যাক্ট করার পর আপনি পরবর্তী ধাপে তথ্য যাচাই করতে পারবেন।
        </p>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onBack}>পূর্ববর্তী</Button>
          <Button onClick={onNext} className="bg-[#1657FF] hover:bg-blue-700" rightIcon={<ArrowRight className="h-4 w-4" />}>
            পরবর্তী ধাপ (Next Step)
          </Button>
        </div>
      </div>
    </div>
  );
}
