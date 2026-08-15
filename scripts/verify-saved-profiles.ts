import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { profileFromEmployeeRow } from "../lib/db-schema";

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
const supabase = createClient(supabaseUrl, serviceKey!);

async function verify() {
  console.log("🔍 Fetching and validating all employee profiles from Supabase...");

  const { data: rows, error } = await supabase.from("employees").select("*").order("id");
  if (error) {
    console.error("Fetch error:", error);
    return;
  }

  console.log(`Found ${rows.length} employee rows:`);
  for (const row of rows) {
    const profile = profileFromEmployeeRow(row);
    console.log(`\n========================================`);
    console.log(`ID: ${profile.employeeId} | Name: ${profile.name}`);
    console.log(`Designation: ${profile.designation} | Dept: ${profile.department} | Status: ${profile.status}`);
    console.log(`NID: ${profile.personalInformation.nid} | Phone: ${profile.phone} | DOB: ${profile.personalInformation.dob}`);
    console.log(`Present Address: ${profile.personalInformation.presentAddress}`);
    console.log(`Permanent Address: ${profile.personalInformation.permanentAddress}`);
    console.log(`Education:`, profile.educationalQualifications);
    console.log(`Experience:`, profile.workExperience);
    console.log(`Certifications/Skills:`, profile.otherDetails?.skills);
  }
}

verify().catch(console.error);
