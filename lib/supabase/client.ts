import { createBrowserClient } from "@supabase/ssr"

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

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey())
}
