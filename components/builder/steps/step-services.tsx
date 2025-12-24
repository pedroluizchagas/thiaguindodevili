"use client"

import { useBuilderContext } from "../builder-context"
import { SERVICE_OPTIONS, ACCOMPANIMENT_OPTIONS } from "@/lib/constants/builder"
import { cn } from "@/lib/utils"
import { Check, Flame, Sparkles, UtensilsCrossed } from "lucide-react"

export function StepServices() {
  const { state, toggleService, toggleAccompaniment } = useBuilderContext()

  const getServiceIcon = (icon: string) => {
    switch (icon) {
      case "flame":
        return <Flame className="w-6 h-6" />
      case "sparkles":
        return <Sparkles className="w-6 h-6" />
      case "utensils":
        return <UtensilsCrossed className="w-6 h-6" />
      default:
        return null
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const isServiceSelected = (id: string) => state.selectedServices.some((s) => s.id === id)
  const isAccompanimentSelected = (id: string) => state.selectedAccompaniments.some((a) => a.id === id)

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-display text-foreground">Queremos facilitar ainda mais?</h2>
        <p className="text-muted-foreground">Adicione serviços e acompanhamentos para uma experiência completa</p>
      </div>

      {/* Services */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Serviços Premium</h3>
        <div className="grid gap-4">
          {SERVICE_OPTIONS.map((service) => {
            const isSelected = isServiceSelected(service.id)

            return (
              <button
                key={service.id}
                onClick={() => toggleService(service)}
                className={cn(
                  "relative flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all",
                  isSelected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50",
                )}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}

                <div
                  className={cn(
                    "p-3 rounded-xl",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {getServiceIcon(service.icon)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground">{service.name}</h4>
                    <span className="text-primary font-display text-xl">+{formatCurrency(service.price)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Accompaniments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Acompanhamentos</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ACCOMPANIMENT_OPTIONS.map((accompaniment) => {
            const isSelected = isAccompanimentSelected(accompaniment.id)

            return (
              <button
                key={accompaniment.id}
                onClick={() => toggleAccompaniment(accompaniment)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                  isSelected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50",
                )}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}

                <span className="font-medium text-foreground text-sm text-center">{accompaniment.name}</span>
                <span className="text-primary font-bold">+{formatCurrency(accompaniment.price)}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
