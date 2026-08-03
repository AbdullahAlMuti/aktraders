/**
 * DEVELOPMENT ONLY SEEDING SCRIPT
 *
 * Usage:
 *   npx ts-node scripts/seed-dev.ts
 *
 * Note:
 *   This script runs ONLY in development mode and creates sample employee records for testing purposes.
 *   It is completely isolated from production.
 */

import { createClient } from "@supabase/supabase-js";

if (process.env.NODE_ENV === "production") {
  console.error("❌ ERROR: Dev seeding cannot be executed in production environment.");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbawcgxjvjkvtgtczseo.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_0zAc34XMxDmlvAXjXVS8Tg_yTuz3aww";

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDevData() {
  console.log("🌱 Starting development seed...");

  const sampleEmployees = [
    {
      id: "DEV-EMP-001",
      name: "Development Test User 1",
      email: "dev.user1@example.com",
      phone: "01700000001",
      department: "IT",
      designation: "Software Engineer",
      status: "active",
      joining_date: "2026-01-15",
    },
    {
      id: "DEV-EMP-002",
      name: "Development Test User 2",
      email: "dev.user2@example.com",
      phone: "01700000002",
      department: "Sales",
      designation: "Account Manager",
      status: "active",
      joining_date: "2026-02-01",
    },
  ];

  for (const emp of sampleEmployees) {
    const { error } = await supabase.from("employees").upsert(emp);
    if (error) {
      console.error(`Error inserting ${emp.id}:`, error.message);
    } else {
      console.log(`✅ Inserted ${emp.id}`);
    }
  }

  console.log("🎉 Dev seeding finished successfully.");
}

seedDevData();
