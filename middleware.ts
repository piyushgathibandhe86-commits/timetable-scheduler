import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware — runs on every request before page/API handlers.
 *
 * Responsibilities (per APP_FLOW.md §3, TRD.md §7):
 *  1. Refresh the Supabase session cookie so it never silently expires mid-session.
 *  2. Redirect unauthenticated users to /login.
 *  3. Redirect authenticated users away from /login (already signed in).
 *  4. Block Viewer roles from Admin-only routes and redirect to their default screen.
 *
 * Role-to-default-screen mapping (APP_FLOW.md §2):
 *  - admin   → /dashboard
 *  - student → /my-timetable
 *  - teacher → /my-lectures
 */

const PUBLIC_PATHS = ["/login"];

const ROLE_HOME: Record<string, string> = {
  admin: "/dashboard",
  student: "/my-timetable",
  teacher: "/my-lectures",
};

const ADMIN_PATHS = ["/dashboard", "/rooms", "/teachers", "/subjects", "/sections", "/setup", "/timetable"];

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — must not call getUser() with stale data, per Supabase SSR docs.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  // 1. Unauthenticated: redirect to login (except on public paths)
  if (!user && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user on login page: redirect to their home
  if (user && pathname === "/login") {
    // Role is stored in the users public table; here we do a lightweight
    // check via user metadata set at sign-up, falling back to the DB query
    // in the login route itself. For middleware speed, use metadata only.
    const role = (user.user_metadata?.role as string) ?? "student";
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = ROLE_HOME[role] ?? "/my-timetable";
    return NextResponse.redirect(homeUrl);
  }

  // 3. Viewer accessing an admin-only route: redirect to their home
  if (user && isAdminPath(pathname)) {
    const role = (user.user_metadata?.role as string) ?? "student";
    if (role !== "admin") {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = ROLE_HOME[role] ?? "/my-timetable";
      return NextResponse.redirect(homeUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - _next/static (static assets)
     *  - _next/image (image optimisation)
     *  - favicon.ico
     *  - api routes (auth checked server-side per route)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
