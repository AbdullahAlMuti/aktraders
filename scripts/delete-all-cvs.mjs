import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// 1. Load .env.local
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

if (!serviceKey) {
  console.error("Missing Supabase Service Key / Anon Key.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function clearDatabaseAndStorage() {
  console.log("=========================================");
  console.log("🗑️  Starting Full CV Database & Storage Purge");
  console.log("=========================================");

  // --- Step 1: Count & Delete cv_records ---
  console.log("\n[1/4] Checking 'cv_records' table...");
  const { data: cvRows, error: cvFetchErr } = await supabase.from("cv_records").select("id");
  if (cvFetchErr) {
    console.error("Error fetching cv_records:", cvFetchErr.message);
  } else {
    const count = cvRows?.length || 0;
    console.log(`Found ${count} rows in 'cv_records'. Deleting...`);
    if (count > 0) {
      const { error: cvDelErr } = await supabase.from("cv_records").delete().neq("id", "___dummy_nonexistent___");
      if (cvDelErr) {
        console.error("Error deleting from cv_records:", cvDelErr.message);
      } else {
        console.log(`✅ Successfully deleted all ${count} rows from 'cv_records'.`);
      }
    } else {
      console.log("Table 'cv_records' is already empty.");
    }
  }

  // --- Step 2: Count & Delete employees ---
  console.log("\n[2/4] Checking 'employees' table...");
  const { data: empRows, error: empFetchErr } = await supabase.from("employees").select("id");
  if (empFetchErr) {
    console.error("Error fetching employees:", empFetchErr.message);
  } else {
    const count = empRows?.length || 0;
    console.log(`Found ${count} rows in 'employees'. Deleting...`);
    if (count > 0) {
      const { error: empDelErr } = await supabase.from("employees").delete().neq("id", "___dummy_nonexistent___");
      if (empDelErr) {
        console.error("Error deleting from employees:", empDelErr.message);
      } else {
        console.log(`✅ Successfully deleted all ${count} rows from 'employees'.`);
      }
    } else {
      console.log("Table 'employees' is already empty.");
    }
  }

  // --- Step 3: Check and Clear Supabase Storage Buckets ---
  console.log("\n[3/4] Checking Supabase Storage Buckets...");
  try {
    const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
    if (bucketErr) {
      console.warn("Notice checking buckets:", bucketErr.message);
    } else if (buckets && buckets.length > 0) {
      console.log(`Found ${buckets.length} storage buckets: ${buckets.map(b => b.name).join(", ")}`);
      for (const b of buckets) {
        const { data: files, error: listErr } = await supabase.storage.from(b.name).list("", { limit: 1000 });
        if (!listErr && files && files.length > 0) {
          const filePaths = files.map((f) => f.name);
          console.log(`Deleting ${filePaths.length} files from bucket '${b.name}'...`);
          const { error: delFilesErr } = await supabase.storage.from(b.name).remove(filePaths);
          if (delFilesErr) {
            console.error(`Error deleting files in bucket '${b.name}':`, delFilesErr.message);
          } else {
            console.log(`✅ Deleted files from bucket '${b.name}'.`);
          }
        } else {
          console.log(`Bucket '${b.name}' is empty.`);
        }
      }
    } else {
      console.log("No cloud storage buckets found.");
    }
  } catch (storageErr) {
    console.warn("Storage check skipped:", storageErr.message);
  }

  // --- Step 4: Clear Local Upload Folders ---
  console.log("\n[4/4] Clearing local uploaded files (public/uploads/)...");
  const localDirs = [
    path.join(process.cwd(), "public", "uploads", "cvs"),
    path.join(process.cwd(), "public", "uploads", "photos"),
    path.join(process.cwd(), "storage", "extracted"),
    path.join(process.cwd(), "storage", "extracted", "photos"),
    path.join(process.cwd(), "storage", "temp")
  ];

  let localFilesDeleted = 0;
  for (const dir of localDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isFile()) {
          fs.unlinkSync(fullPath);
          localFilesDeleted++;
        }
      }
      console.log(`Cleaned directory: ${path.relative(process.cwd(), dir)}`);
    }
  }
  console.log(`✅ Deleted ${localFilesDeleted} local stored files.`);

  console.log("\n=========================================");
  console.log("🎉 Complete Purge Finished Successfully!");
  console.log("=========================================");
}

clearDatabaseAndStorage().catch((err) => {
  console.error("Fatal error during deletion:", err);
  process.exit(1);
});
