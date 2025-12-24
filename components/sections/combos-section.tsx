"use client"

import { Check, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/ui/section-header"
import { COMBOS } from "@/lib/constants"
import type { Combo } from "@/lib/types"
import { cn } from "@/lib/utils"

function ComboCard({ combo }: { combo: Combo }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-8 transition-all duration-300 group",
        combo.popular
          ? "bg-gradient-to-b from-primary/20 to-card border-2 border-primary scale-105 lg:scale-110"
          : "bg-card border border-border hover:border-primary/50",
      )}
    >
      {/* Popular Badge */}
      {combo.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-bold rounded-full flex items-center gap-2">
          <Flame size={16} />
          MAIS PEDIDO
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-foreground mb-2">
          {combo.name}
        </h3>
        <p className="text-muted-foreground">{combo.description}</p>
        <div className="mt-4">
          <span className="text-4xl font-bold text-primary">{combo.price}</span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {combo.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check size={18} className="text-primary mt-0.5 flex-shrink-0" />
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        className={cn(
          "w-full font-semibold py-6",
          combo.popular
            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
            : "bg-secondary hover:bg-secondary/80 text-foreground border border-border",
        )}
      >
        Escolher {combo.name}
      </Button>
    </div>
  )
}

export function CombosSection() {
  return (
    <section id="combos" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Escolha Sua Resenha"
          subtitle="Combos pensados para todos os tamanhos de festa. Do encontro íntimo à celebração épica."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6 items-start">
          {COMBOS.map((combo) => (
            <ComboCard key={combo.id} combo={combo} />
          ))}
        </div>

        {/* Custom Combo CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">Precisa de algo personalizado para sua resenha?</p>
          <Button
            variant="outline"
            size="lg"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
          >
            Monte Seu Combo Personalizado
          </Button>
        </div>
      </div>
    </section>
  )
}
