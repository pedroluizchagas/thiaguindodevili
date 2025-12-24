import { Card, CardContent } from "@/components/ui/card"
import { Box, CheckCircle, Truck, Wrench, AlertTriangle } from "lucide-react"

interface CoolerStatsProps {
  stats: {
    total: number
    available: number
    inUse: number
    maintenance: number
    lost: number
  }
}

export function CoolerStats({ stats }: CoolerStatsProps) {
  const statCards = [
    {
      title: "Total",
      value: stats.total,
      icon: Box,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Disponíveis",
      value: stats.available,
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Em Uso",
      value: stats.inUse,
      icon: Truck,
      color: "text-primary",
      bgColor: "bg-primary/20",
    },
    {
      title: "Manutenção",
      value: stats.maintenance,
      icon: Wrench,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
    {
      title: "Perdidos",
      value: stats.lost,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {statCards.map((stat) => (
        <Card key={stat.title} className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
