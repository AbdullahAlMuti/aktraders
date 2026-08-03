import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/types/api.types";

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message) {
      return data.message;
    }
    if (error.response?.status === 401) {
      return "অনুমোদন ব্যর্থ হয়েছে। আবার লগইন করুন। (Unauthorized access)";
    }
    if (error.response?.status === 403) {
      return "আপনার এই কার্যক্রমে অনুমতি নেই। (Forbidden access)";
    }
    if (error.response?.status === 404) {
      return "অনুরোধকৃত ডাটা পাওয়া যায়নি। (Resource not found)";
    }
    if (error.response?.status === 500) {
      return "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন। (Server error)";
    }
    return error.message || "নেটওয়ার্ক সংযোগে ত্রুটি ঘটেছে।";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। (An unexpected error occurred)";
}
