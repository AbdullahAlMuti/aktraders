import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join("=").trim();
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, anonKey);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "admin@aktraders.com",
    password: "AdminPassword123!",
  });

  if (error) {
    console.error("❌ Login failed:", error.message);
    process.exit(1);
  } else {
    console.log("✅ LOGIN SUCCESSFUL!");
    console.log("   User ID:", data.user?.id);
    console.log("   Email:", data.user?.email);
    console.log("   Access Token generated successfully.");
    process.exit(0);
  }
}

testLogin().catch(console.error);
