"use client"

import { useBuilderContext } from "./builder-context"
import { cn } from "@/lib/utils"

interface PriceDisplayProps {
  className?: string
  showInstallments?: boolean
}

export function PriceDisplay({ className, showInstallments = true }: PriceDisplayProps) {
  const { calculateTotal } = useBuilderContext()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const installmentValue = calculateTotal / 3

  return (
    <div className={cn("bg-card border border-border rounded-xl p-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total estimado</span>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary font-display">{formatCurrency(calculateTotal)}</span>
          {showInstallments && calculateTotal > 0 && (
            <p className="text-xs text-muted-foreground">ou 3x de {formatCurrency(installmentValue)}</p>
          )}
        </div>
      </div>
    </div>
  )
}
