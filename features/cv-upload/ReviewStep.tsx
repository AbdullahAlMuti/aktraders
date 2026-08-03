"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function ReviewStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      fullName: "MD. RAHIM HASAN",
      designation: "Senior Executive",
      department: "Sales",
      email: "rahim.hasan@email.com",
      phone: "01712345678",
      nidNo: "1993123456789012",
      dob: "1993-01-15",
      degree: "BSc in Computer Science and Engineering",
      institution: "University of Dhaka",
      experienceYears: "3.5",
    },
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Review & Edit Extracted Data
          </h3>
          <p className="text-xs text-slate-500">Please review and edit the fields below if necessary.</p>
        </div>
        <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> AI Accuracy: 96%
        </span>
      </div>

      <form onSubmit={handleSubmit(() => onNext())} className="space-y-6">
        {/* Personal Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            1. Personal Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Full Name" {...register("fullName")} />
            <Input label="Email Address" type="email" {...register("email")} />
            <Input label="Phone Number" {...register("phone")} />
            <Input label="NID Number" {...register("nidNo")} />
            <Input label="Date of Birth" type="date" {...register("dob")} />
            <Select
              label="Department"
              options={[
                { label: "Sales", value: "Sales" },
                { label: "Operations", value: "Operations" },
                { label: "HR", value: "HR" },
                { label: "Finance", value: "Finance" },
                { label: "IT", value: "IT" },
              ]}
              {...register("department")}
            />
          </div>
        </div>

        {/* Professional & Academic */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            2. Professional & Academic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Designation" {...register("designation")} />
            <Input label="Highest Degree" {...register("degree")} />
            <Input label="Institution" {...register("institution")} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="bg-[#1657FF] hover:bg-blue-700" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Save & Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
