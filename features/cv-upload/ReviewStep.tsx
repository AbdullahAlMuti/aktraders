"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

interface ReviewStepProps {
  initialData: any;
  onNext: (formData: any) => void;
  onBack: () => void;
}

export function ReviewStep({ initialData, onNext, onBack }: ReviewStepProps) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      fullName: initialData?.fullName || "",
      designation: initialData?.designation || "",
      department: initialData?.department || "General",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      nidNo: initialData?.nidNo || "",
      dob: initialData?.dob || "",
      degree: initialData?.degree || "",
      institution: initialData?.institution || "",
      cvFileName: initialData?.cvFileName || "",
      cvFileSize: initialData?.cvFileSize || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        fullName: initialData.fullName || "",
        designation: initialData.designation || "",
        department: initialData.department || "General",
        email: initialData.email || "",
        phone: initialData.phone || "",
        nidNo: initialData.nidNo || "",
        dob: initialData.dob || "",
        degree: initialData.degree || "",
        institution: initialData.institution || "",
        cvFileName: initialData.cvFileName || "",
        cvFileSize: initialData.cvFileSize || "",
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data: any) => {
    onNext({
      ...initialData,
      ...data,
    });
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#0c0d0e] space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Review & Edit Extracted Data
          </h3>
          <p className="text-xs text-neutral-500">
            Verify and adjust the fields below before saving to the employee database.
          </p>
        </div>
        <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> File Processed
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#cc785c]">
            1. Personal Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Full Name" placeholder="Full name" {...register("fullName")} />
            <Input label="Email Address" type="email" placeholder="Email address" {...register("email")} />
            <Input label="Phone Number" placeholder="Phone number" {...register("phone")} />
            <Input label="NID Number" placeholder="NID number" {...register("nidNo")} />
            <Input label="Date of Birth" type="date" {...register("dob")} />
            <Select
              label="Department"
              options={[
                { label: "General", value: "General" },
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
        <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#cc785c]">
            2. Professional & Academic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Designation" placeholder="Designation" {...register("designation")} />
            <Input label="Highest Degree" placeholder="Degree" {...register("degree")} />
            <Input label="Institution" placeholder="Institution name" {...register("institution")} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="bg-[#cc785c] hover:bg-[#a9583e] font-semibold text-white" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Save Record to Database
          </Button>
        </div>
      </form>
    </div>
  );
}
