import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "ইমেইল প্রয়োজন / Email is required")
  .email("সঠিক ইমেইল ফরম্যাট লিখুন / Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(6, "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে / Password must be at least 6 characters");

export const phoneSchema = z
  .string()
  .regex(/^(?:\+8801|01)[3-9]\d{8}$/, "সঠিক বাংলাদেশী মোবাইল নম্বর দিন / Enter valid BD phone number");

export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: "ফাইল আপলোড করুন / File is required" })
    .refine((file) => file.size <= 10 * 1024 * 1024, "সর্বোচ্চ ১০ এমবি ফাইল সাপোর্ট করবে / Max file size is 10MB")
    .refine(
      (file) => ["application/pdf", "image/jpeg", "image/png"].includes(file.type),
      "কেবলমাত্র PDF, JPG, PNG ফাইল সমর্থিত / Only PDF, JPG, PNG supported"
    ),
});
