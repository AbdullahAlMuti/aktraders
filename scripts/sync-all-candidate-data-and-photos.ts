import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envConfig = fs.readFileSync(".env.local", "utf8");
const env = Object.fromEntries(
  envConfig
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const [k, ...v] = l.split("=");
      return [k.trim(), v.join("=").trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const photoMappings = [
  // 5 Scanned Verified Candidates
  {
    empId: "EMP-085596",
    cvId: "cv-emp-085596",
    photoUrl: "/uploads/photos/photo_redoy_hossain.jpg",
  },
  {
    empId: "EMP-935752",
    cvId: "cv-emp-935752",
    photoUrl: "/uploads/photos/photo_bashiron_begum.jpg",
  },
  {
    empId: "EMP-229387",
    cvId: "cv-emp-229387",
    photoUrl: "/uploads/photos/photo_moriam_begum.jpg",
  },
  {
    empId: "EMP-288965",
    cvId: "cv-emp-288965",
    photoUrl: "/uploads/photos/photo_moshin.jpg",
  },
  {
    empId: "EMP-647253",
    cvId: "cv-emp-647253",
    photoUrl: "/uploads/photos/photo_ranju_mia.jpg",
  },
  // Earlier Candidates
  {
    empId: "EMP-000001",
    cvId: "cv-emp-000001",
    photoUrl: "/uploads/photos/photo_bashiron_begum.jpg",
  },
  {
    empId: "EMP-000002",
    cvId: "cv-emp-000002",
    photoUrl: "/uploads/photos/photo_kallani_das.jpg",
  },
  {
    empId: "EMP-000003",
    cvId: "cv-emp-000003",
    photoUrl: "/uploads/photos/photo_lucky_akter.jpg",
  },
  {
    empId: "EMP-000004",
    cvId: "cv-emp-000004",
    photoUrl: "/uploads/photos/photo_hridoy_hosen.jpg",
  },
  {
    empId: "EMP-000005",
    cvId: "cv-emp-000005",
    photoUrl: "/uploads/photos/photo_ranju_mia.jpg",
  },
  {
    empId: "EMP-000006",
    cvId: "cv-emp-000006",
    photoUrl: "/uploads/photos/photo_moriam_begum.jpg",
  },
];

async function syncAll() {
  console.log("Starting full photo sync...");

  for (const item of photoMappings) {
    // 1. Fetch current employee row
    const { data: emp } = await supabase
      .from("employees")
      .select("id, cv_data")
      .eq("id", item.empId)
      .single();

    if (emp) {
      let cvData = emp.cv_data || {};
      if (typeof cvData === "string") {
        try {
          cvData = JSON.parse(cvData);
        } catch (_) {}
      }
      cvData.avatarUrl = item.photoUrl;
      if (cvData.personalInformation) {
        cvData.personalInformation.photoUrl = item.photoUrl;
      }

      await supabase
        .from("employees")
        .update({
          avatar_url: item.photoUrl,
          cv_data: cvData,
        })
        .eq("id", item.empId);

      console.log(`[OK] Updated employees table for ${item.empId} -> ${item.photoUrl}`);
    }

    // 2. Update cv_records row
    await supabase
      .from("cv_records")
      .update({ avatar_url: item.photoUrl })
      .eq("id", item.cvId);

    console.log(`[OK] Updated cv_records table for ${item.cvId} -> ${item.photoUrl}`);
  }

  // Verify
  const { data: employees } = await supabase
    .from("employees")
    .select("id, name, avatar_url")
    .order("id");

  console.log("\n--- Verification Summary (Employees Table) ---");
  console.table(employees);

  const { data: cvRecords } = await supabase
    .from("cv_records")
    .select("id, candidate_name, avatar_url")
    .order("id");

  console.log("\n--- Verification Summary (CV Records Table) ---");
  console.table(cvRecords);
}

syncAll().catch(console.error);
