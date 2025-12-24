import { createClient } from "@/lib/supabase/server"
import { OrdersKanban } from "@/components/admin/orders-kanban"
import { KANBAN_COLUMNS } from "@/lib/constants/admin"
import type { KanbanColumn, Order } from "@/lib/types/admin"

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from("orders")
    .select("*, customer:customers(*), cooler:coolers(*), assigned_driver:profiles(*)")
    .order("created_at", { ascending: false })

  // Organize orders into kanban columns
  const columns: KanbanColumn[] = KANBAN_COLUMNS.map((status) => ({
    id: status,
    title: status,
    color: "",
    orders: (orders || []).filter((order: Order) => order.status === status),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Pedidos</h2>
          <p className="text-muted-foreground">Arraste os cards para atualizar o status</p>
        </div>
      </div>

      <OrdersKanban initialColumns={columns} />
    </div>
  )
}
