import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kvddegdgvdzldlwslvre.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

console.log("Connecting to:", supabaseUrl);
console.log("Using key:", serviceKey?.slice(0, 15) + "...");

const supabase = createClient(supabaseUrl, serviceKey!);

async function main() {
  const { data, error } = await supabase.from("employees").select("id, name, designation, department").limit(10);
  if (error) {
    console.error("Error querying employees:", error);
  } else {
    console.log("Employees query success! Row count:", data?.length);
    console.log("Rows:", data);
  }

  const { data: cvData, error: cvError } = await supabase.from("cv_records").select("id, candidate_name").limit(10);
  if (cvError) {
    console.error("Error querying cv_records:", cvError);
  } else {
    console.log("cv_records query success! Row count:", cvData?.length);
    console.log("Rows:", cvData);
  }
}

main().catch(console.error);
