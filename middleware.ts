import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase environment variables are not set, pass through safely without crashing
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  try {
    const { createClient } = await import("@/utils/supabase/middleware");
    const { supabase, supabaseResponse } = createClient(request);

    // Refresh session — required for @supabase/ssr cookie-based auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;
    const isAuthRoute = pathname.startsWith("/login");
    const isPublicRoute = pathname.startsWith("/api/");

    // Redirect unauthenticated users to /login
    if (!user && !isAuthRoute && !isPublicRoute) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from /login
    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return supabaseResponse;
  } catch (error) {
    // If Supabase fails or throws, gracefully fallback to normal response
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static asset files (svg, png, jpg, jpeg, gif, webp, css, js)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
};
