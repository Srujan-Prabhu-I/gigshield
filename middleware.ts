import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // 1. Get the current user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const path = url.pathname

  // Public paths that do not require auth or role checks (so we don't break the existing MVP)
  const isPublicPath = 
    path === '/' || 
    path.startsWith('/auth/') || 
    path.startsWith('/api/') || 
    path === '/checker' ||
    path === '/grievance' ||
    path === '/worker-rights' ||
    path === '/leaderboard' ||
    path === '/compare' ||
    path === '/impact' ||
    path === '/platform-portal' ||
    path.includes('.') // static files

  if (isPublicPath) {
    return supabaseResponse
  }

  // 2. Protect Authenticated Routes
  if (!user) {
    // Redirect unauthenticated users to home page to login
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // 3. Fetch User Role — defensively, in case the table doesn't exist yet
  let userRole: string | null = null
  try {
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!roleError && roleData) {
      userRole = roleData.role
    }
  } catch {
    // DB not ready yet, proceed without role enforcement
    return supabaseResponse
  }


  // Helper: convert stored role string to the correct URL path
  const roleToPath = (r: string) => {
    if (r === 'worker') return '/worker'
    if (r === 'platform') return '/platform'
    if (r === 'government') return '/govt'
    return '/'
  }

  if (userRole && path === '/select-role') {
    url.pathname = roleToPath(userRole)
    return NextResponse.redirect(url)
  }

  // 5. Enforce Portal-Specific Access Constraints
  if (path.startsWith('/worker') && userRole !== 'worker') {
    url.pathname = userRole ? roleToPath(userRole) : '/'
    return NextResponse.redirect(url)
  }

  if (path.startsWith('/platform') && userRole !== 'platform') {
    url.pathname = userRole ? roleToPath(userRole) : '/'
    return NextResponse.redirect(url)
  }

  if (path.startsWith('/govt') && userRole !== 'government') {
    url.pathname = userRole ? roleToPath(userRole) : '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
