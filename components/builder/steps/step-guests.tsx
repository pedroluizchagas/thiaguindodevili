"use client"

import { useBuilderContext } from "../builder-context"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Users } from "lucide-react"
import { CALCULATION_DEFAULTS } from "@/lib/constants/builder"
import { cn } from "@/lib/utils"

export function StepGuests() {
  const { state, setGuests, suggestedBeers } = useBuilderContext()

  const presetValues = [6, 10, 15, 20, 30]

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-display text-foreground">Quantos amigos estarão na resenha?</h2>
        <p className="text-muted-foreground">Vamos calcular tudo para você não ter trabalho</p>
      </div>

      {/* Main Counter */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-48 h-48 rounded-full bg-card border-4 border-primary/30 flex items-center justify-center relative overflow-hidden">
            {/* Animated fill based on guests */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-primary/20 transition-all duration-500"
              style={{ height: `${(state.guests / CALCULATION_DEFAULTS.maxGuests) * 100}%` }}
            />
            <div className="relative z-10 flex flex-col items-center">
              <Users className="w-8 h-8 text-primary mb-2" />
              <span className="text-6xl font-display text-foreground">{state.guests}</span>
              <span className="text-sm text-muted-foreground">pessoas</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full bg-transparent"
            onClick={() => setGuests(state.guests - 1)}
            disabled={state.guests <= CALCULATION_DEFAULTS.minGuests}
          >
            <Minus className="w-6 h-6" />
          </Button>

          <div className="flex gap-2">
            {presetValues.map((value) => (
              <Button
                key={value}
                variant={state.guests === value ? "default" : "outline"}
                size="sm"
                onClick={() => setGuests(value)}
                className={cn("w-12 h-12 rounded-full font-bold", state.guests === value && "ring-2 ring-primary/50")}
              >
                {value}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full bg-transparent"
            onClick={() => setGuests(state.guests + 1)}
            disabled={state.guests >= CALCULATION_DEFAULTS.maxGuests}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-muted/50 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Recomendação automática:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-lg p-4 text-center">
            <span className="text-3xl font-display text-primary">
              {((state.guests * CALCULATION_DEFAULTS.meatPerPerson) / 1000).toFixed(1)}kg
            </span>
            <p className="text-sm text-muted-foreground">de carne</p>
          </div>
          <div className="bg-card rounded-lg p-4 text-center">
            <span className="text-3xl font-display text-primary">{suggestedBeers}</span>
            <p className="text-sm text-muted-foreground">cervejas</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">Baseado em 400g de carne e 4 cervejas por pessoa</p>
      </div>
    </div>
  )
}
