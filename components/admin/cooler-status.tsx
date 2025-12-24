import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { COOLER_STATUS_CONFIG } from "@/lib/constants/admin"
import type { Cooler } from "@/lib/types/admin"
import Link from "next/link"
import { ArrowRight, QrCode } from "lucide-react"

interface CoolerStatusProps {
  coolers: Cooler[]
}

export function CoolerStatus({ coolers }: CoolerStatusProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Status dos Coolers</CardTitle>
        <Link href="/admin/coolers" className="text-sm text-primary hover:underline flex items-center gap-1">
          Gerenciar <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {coolers.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Nenhum cooler cadastrado</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {coolers.slice(0, 8).map((cooler) => {
              const statusConfig = COOLER_STATUS_CONFIG[cooler.status]
              return (
                <div
                  key={cooler.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30"
                >
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono font-medium text-foreground">{cooler.qr_code}</span>
                  </div>
                  <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0 text-xs`}>
                    {statusConfig.label}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
