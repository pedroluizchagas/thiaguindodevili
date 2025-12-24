import { createClient } from "@/lib/supabase/server"
import { CoolersTable } from "@/components/admin/coolers-table"
import { CoolerStats } from "@/components/admin/cooler-stats"
import { AddCoolerDialog } from "@/components/admin/add-cooler-dialog"

export default async function CoolersPage() {
  const supabase = await createClient()

  const { data: coolers } = await supabase.from("coolers").select("*").order("qr_code")

  // Calculate stats
  const stats = {
    total: coolers?.length || 0,
    available: coolers?.filter((c) => c.status === "available").length || 0,
    inUse: coolers?.filter((c) => c.status === "in_use").length || 0,
    maintenance: coolers?.filter((c) => c.status === "maintenance").length || 0,
    lost: coolers?.filter((c) => c.status === "lost").length || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Coolers</h2>
          <p className="text-muted-foreground">Rastreamento de ativos com QR Code</p>
        </div>
        <AddCoolerDialog />
      </div>

      <CoolerStats stats={stats} />
      <CoolersTable coolers={coolers || []} />
    </div>
  )
}
