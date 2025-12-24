"use client"

import { useBuilderContext } from "../builder-context"
import { MEAT_OPTIONS } from "@/lib/constants/builder"
import { cn } from "@/lib/utils"
import { Check, Crown, Star, Flame } from "lucide-react"
import Image from "next/image"

export function StepMeat() {
  const { state, setMeat } = useBuilderContext()

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "raiz":
        return <Flame className="w-5 h-5" />
      case "ouro":
        return <Star className="w-5 h-5" />
      case "lenda":
        return <Crown className="w-5 h-5" />
      default:
        return null
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "raiz":
        return "from-orange-500/20 to-red-500/20 border-orange-500/50"
      case "ouro":
        return "from-yellow-500/20 to-amber-500/20 border-yellow-500/50"
      case "lenda":
        return "from-purple-500/20 to-pink-500/20 border-purple-500/50"
      default:
        return ""
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-display text-foreground">Qual o nível da churrascada?</h2>
        <p className="text-muted-foreground">Escolha o kit de carnes perfeito para sua resenha</p>
      </div>

      <div className="grid gap-6">
        {MEAT_OPTIONS.map((option) => {
          const isSelected = state.selectedMeat?.id === option.id
          const totalPrice = option.pricePerPerson * state.guests

          return (
            <button
              key={option.id}
              onClick={() => setMeat(option)}
              className={cn(
                "relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all",
                "bg-gradient-to-r",
                getTierColor(option.tier),
                isSelected ? "ring-4 ring-primary/50 border-primary" : "hover:border-primary/50",
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="relative w-full md:w-48 h-40 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={option.image || "/placeholder.svg"} alt={option.name} fill className="object-cover" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "p-2 rounded-lg",
                        option.tier === "raiz" && "bg-orange-500/20 text-orange-400",
                        option.tier === "ouro" && "bg-yellow-500/20 text-yellow-400",
                        option.tier === "lenda" && "bg-purple-500/20 text-purple-400",
                      )}
                    >
                      {getTierIcon(option.tier)}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{option.name}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {option.items.map((item) => (
                      <span key={item} className="px-3 py-1 bg-background/50 rounded-full text-sm text-foreground">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-end justify-between pt-2">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(option.pricePerPerson)}/pessoa
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">Total para {state.guests} pessoas</span>
                      <p className="text-2xl font-display text-primary">{formatCurrency(totalPrice)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
