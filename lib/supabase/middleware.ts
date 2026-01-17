import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function getSupabaseUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!rawUrl) {
    throw new Error("Configuração ausente: defina NEXT_PUBLIC_SUPABASE_URL")
  }

  const normalizedUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`

  try {
    return new URL(normalizedUrl).toString().replace(/\/$/, "")
  } catch {
    throw new Error(`Configuração inválida: NEXT_PUBLIC_SUPABASE_URL="${rawUrl}"`)
  }
}

function getSupabaseAnonKey() {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!anonKey) {
    throw new Error("Configuração ausente: defina NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
  return anonKey
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
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
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  let user = null as Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]
  try {
    const {
      data: { user: resolvedUser },
    } = await supabase.auth.getUser()
    user = resolvedUser
  } catch {
    user = null
  }

  const isLoginPage = request.nextUrl.pathname === "/admin/login"

  // Redirect logged-in users from login to dashboard
  if (isLoginPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin"
    return NextResponse.redirect(url)
  }

  // Protect admin routes (except login page)
  if (request.nextUrl.pathname.startsWith("/admin") && !isLoginPage && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
