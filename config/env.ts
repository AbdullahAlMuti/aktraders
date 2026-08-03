import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("https://api.aktraders.com/v1"),
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  NEXT_PUBLIC_ENABLE_MOCK_API: z.string().transform((val) => val === "true").default("true"),
});

export const env = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.aktraders.com/v1",
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || "development",
  NEXT_PUBLIC_ENABLE_MOCK_API: process.env.NEXT_PUBLIC_ENABLE_MOCK_API !== "false",
};
