import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export const metadata = {
  title: "Admin | Quem Fez, Fez!",
  description: "Painel administrativo Quem Fez, Fez!",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return <>{children}</>
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar user={user} profile={profile} />
      <div className="flex-1 flex flex-col lg:ml-64">
        <AdminHeader user={user} profile={profile} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
