"use client"

import { useState } from "react"
import { useBuilderContext } from "../builder-context"
import { BEVERAGE_OPTIONS } from "@/lib/constants/builder"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Check, Minus, Plus, Beer, Droplets } from "lucide-react"
import Image from "next/image"

export function StepBeverages() {
  const { state, addBeverage, removeBeverage, updateBeverageQuantity, suggestedBeers } = useBuilderContext()

  const categories = [
    { id: "cerveja", label: "Cervejas", icon: Beer },
    { id: "outros", label: "Outros", icon: Droplets },
  ]

  const [activeCategory, setActiveCategory] = useState("cerveja")

  const filteredBeverages = BEVERAGE_OPTIONS.filter((b) =>
    activeCategory === "cerveja" ? b.category === "cerveja" : b.category !== "cerveja",
  )

  const getSelectedBeverage = (id: string) => {
    return state.selectedBeverages.find((b) => b.option.id === id)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleQuantityChange = (option: (typeof BEVERAGE_OPTIONS)[0], delta: number) => {
    const existing = getSelectedBeverage(option.id)
    const currentQty = existing?.quantity || 0
    const newQty = Math.max(0, currentQty + delta)

    if (newQty === 0) {
      removeBeverage(option.id)
    } else {
      addBeverage(option, newQty)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-display text-foreground">O que vai no gelo?</h2>
        <p className="text-muted-foreground">
          Para {state.guests} pessoas, recomendamos{" "}
          <span className="text-primary font-bold">{suggestedBeers} cervejas</span>
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            onClick={() => setActiveCategory(category.id)}
            className="gap-2"
          >
            <category.icon className="w-4 h-4" />
            {category.label}
          </Button>
        ))}
      </div>

      {/* Beverages Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredBeverages.map((option) => {
          const selected = getSelectedBeverage(option.id)
          const isSelected = !!selected

          return (
            <div
              key={option.id}
              className={cn(
                "relative rounded-xl border-2 p-4 transition-all",
                isSelected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50",
              )}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}

              <div className="flex flex-col items-center gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={option.image || "/placeholder.svg"}
                    alt={option.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>

                <div className="text-center">
                  <h4 className="font-semibold text-foreground text-sm">{option.name}</h4>
                  <p className="text-xs text-muted-foreground">{formatCurrency(option.pricePerUnit)}/un</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 bg-transparent"
                    onClick={() => handleQuantityChange(option, option.category === "gin" ? -1 : -6)}
                    disabled={!isSelected}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-bold text-foreground">{selected?.quantity || 0}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 bg-transparent"
                    onClick={() => handleQuantityChange(option, option.category === "gin" ? 1 : 6)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {isSelected && (
                  <p className="text-xs text-primary font-medium">
                    {formatCurrency(option.pricePerUnit * (selected?.quantity || 0))}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Add Suggestion */}
      {activeCategory === "cerveja" &&
        state.selectedBeverages.filter((b) => b.option.category === "cerveja").length === 0 && (
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Sugestão rápida: adicionar {suggestedBeers} cervejas Heineken
            </p>
            <Button variant="outline" onClick={() => addBeverage(BEVERAGE_OPTIONS[0], suggestedBeers)}>
              Adicionar Sugestão
            </Button>
          </div>
        )}
    </div>
  )
}
