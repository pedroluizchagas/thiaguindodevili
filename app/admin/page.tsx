import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { RecentOrders } from "@/components/admin/recent-orders"
import { CoolerStatus } from "@/components/admin/cooler-status"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch dashboard statistics
  const today = new Date().toISOString().split("T")[0]

  const [
    { count: totalOrders },
    { count: todayOrders },
    { count: pendingOrders },
    { data: revenueData },
    { count: availableCoolers },
    { count: totalCoolers },
    { data: recentOrders },
    { data: coolers },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("delivery_date", today),
    supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["new", "picking", "in_route"]),
    supabase.from("orders").select("total").not("status", "eq", "completed"),
    supabase.from("coolers").select("*", { count: "exact", head: true }).eq("status", "available"),
    supabase.from("coolers").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*, customer:customers(*)").order("created_at", { ascending: false }).limit(5),
    supabase.from("coolers").select("*").order("qr_code"),
  ])

  const revenue = revenueData?.reduce((sum, order) => sum + Number(order.total), 0) || 0

  const stats = {
    totalOrders: totalOrders || 0,
    todayOrders: todayOrders || 0,
    pendingOrders: pendingOrders || 0,
    revenue,
    availableCoolers: availableCoolers || 0,
    totalCoolers: totalCoolers || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral da operação</p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrders orders={recentOrders || []} />
        <CoolerStatus coolers={coolers || []} />
      </div>
    </div>
  )
}
