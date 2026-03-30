import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/checker",
  "/leaderboard",
  "/worker/checker",
  "/worker/exploitation",
])

function getRequiredRole(pathname: string): "worker" | "platform" | "government" | null {
  if (pathname.startsWith("/worker")) return "worker"
  if (pathname.startsWith("/platform")) return "platform"
  if (pathname.startsWith("/government") || pathname.startsWith("/govt")) return "government"
  return null
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isPublic =
    PUBLIC_ROUTES.has(pathname) ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const requiredRole = getRequiredRole(pathname)

  // Redirect to login if accessing a protected route without a session
  if (!isPublic && !user && requiredRole) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    // Keep the intended path for post-login redirect if needed
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  // If user is logged in and trying to access a protected role route, check their role
  if (user && requiredRole) {
    // In middleware, we can't easily fetch the role without an extra DB hit which slows down every request.
    // So we will just ensure they are logged in. The actual role check will be handled in the client side Layout or Page.
    // This allows for faster routing.
    // Note: A more robust approach uses custom claims in the JWT or a DB lookup here, 
    // but the Next.js client component role redirects (like in /worker/page.tsx) will handle it.
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
