import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ORDER_STATUS_CONFIG } from "@/lib/constants/admin"
import type { Order } from "@/lib/types/admin"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
        <Link href="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
          Ver todos <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Nenhum pedido encontrado</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const statusConfig = ORDER_STATUS_CONFIG[order.status]
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Pedido #{order.order_number}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.customer?.name || "Cliente não informado"}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                      {statusConfig.label}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      R$ {Number(order.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
