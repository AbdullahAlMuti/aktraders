import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email address is required")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long");

export const phoneSchema = z
  .string()
  .regex(/^(?:\+8801|01)[3-9]\d{8}$/, "Please enter a valid phone number");

export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: "File is required" })
    .refine((file) => file.size <= 10 * 1024 * 1024, "Maximum file size supported is 10MB")
    .refine(
      (file) => ["application/pdf", "image/jpeg", "image/png"].includes(file.type),
      "Only PDF, JPG, and PNG files are supported"
    ),
});
