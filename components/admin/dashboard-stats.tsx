import { Card, CardContent } from "@/components/ui/card"
import { Package, Calendar, Clock, DollarSign, Box, CheckCircle } from "lucide-react"
import type { DashboardStats as DashboardStatsType } from "@/lib/types/admin"

interface DashboardStatsProps {
  stats: DashboardStatsType
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total de Pedidos",
      value: stats.totalOrders,
      icon: Package,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Pedidos Hoje",
      value: stats.todayOrders,
      icon: Calendar,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
    },
    {
      title: "Pendentes",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
    {
      title: "Receita Ativa",
      value: `R$ ${stats.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/20",
    },
    {
      title: "Coolers Disponíveis",
      value: `${stats.availableCoolers}/${stats.totalCoolers}`,
      icon: Box,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
    },
    {
      title: "Taxa de Disponibilidade",
      value: `${stats.totalCoolers ? Math.round((stats.availableCoolers / stats.totalCoolers) * 100) : 0}%`,
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
