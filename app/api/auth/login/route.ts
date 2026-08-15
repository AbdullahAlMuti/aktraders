import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { UserRole } from "@/types/auth.types";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ error: "User authentication failed" }, { status: 401 });
    }

    // Fetch user profile from public.profiles table
    let dbProfile: any = null;
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      dbProfile = prof;
    } catch {
      // Ignore fallback
    }

    // Upsert to ensure profile exists
    if (!dbProfile) {
      const newProf = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
        role: (data.user.app_metadata?.role || data.user.user_metadata?.role || "superadmin") as UserRole,
        department: data.user.user_metadata?.department || "Management",
      };
      await supabase.from("profiles").upsert(newProf);
      dbProfile = newProf;
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        name: dbProfile?.name || data.user.user_metadata?.name || data.user.email || "User",
        email: data.user.email!,
        role: (dbProfile?.role || data.user.app_metadata?.role || data.user.user_metadata?.role || "employee") as UserRole,
        department: dbProfile?.department || data.user.user_metadata?.department,
        avatarUrl: dbProfile?.avatar_url || data.user.user_metadata?.avatar_url,
        createdAt: data.user.created_at,
      },
      token: data.session?.access_token || "",
      refreshToken: data.session?.refresh_token || "",
    });
  } catch (err: any) {
    console.error("Login API route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
