import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Read .env.local manually
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log("Connecting to Supabase at:", supabaseUrl);
  
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Error listing users:", listError.message);
    process.exit(1);
  }

  console.log(`Found ${usersData.users.length} existing users:`);
  for (const u of usersData.users) {
    console.log(`- Email: ${u.email} (ID: ${u.id}, Confirmed: ${u.email_confirmed_at ? "Yes" : "No"})`);
  }

  const adminEmail = "admin@aktraders.com";
  const adminPassword = "AdminPassword123!";

  const existingAdmin = usersData.users.find((u) => u.email === adminEmail);

  if (!existingAdmin) {
    console.log(`\nCreating default admin user (${adminEmail})...`);
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: "System Admin",
        role: "admin",
        department: "IT",
      },
    });

    if (createError) {
      console.error("Error creating admin user:", createError.message);
    } else {
      console.log(`✅ Default admin created successfully!`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);

      if (newUser.user) {
        const { error: profError } = await supabase.from("profiles").upsert({
          id: newUser.user.id,
          email: adminEmail,
          name: "System Admin",
          role: "admin",
          department: "IT",
          updated_at: new Date().toISOString(),
        });
        if (profError) {
          console.log("Profile upsert notice:", profError.message);
        } else {
          console.log("✅ Profile created in public.profiles table!");
        }
      }
    }
  } else {
    console.log(`\nDefault admin (${adminEmail}) already exists.`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(existingAdmin.id, {
      password: adminPassword,
      email_confirm: true,
    });
    if (updateError) {
      console.error("Error updating admin password:", updateError.message);
    } else {
      console.log(`✅ Admin password reset to: ${adminPassword}`);
    }
  }
}

main().catch(console.error);
