import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/types/api.types";

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message) {
      return data.message;
    }
    if (error.response?.status === 401) {
      return "Unauthorized access. Please log in again.";
    }
    if (error.response?.status === 403) {
      return "Forbidden access. You do not have permission to perform this action.";
    }
    if (error.response?.status === 404) {
      return "Requested resource not found.";
    }
    if (error.response?.status === 500) {
      return "Internal server error. Please try again later.";
    }
    return error.message || "A network error occurred.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}
