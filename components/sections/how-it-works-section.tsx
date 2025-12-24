"use client"

import { Package, Truck, Flame, Sparkles, CheckCircle2 } from "lucide-react"
import { SectionHeader } from "@/components/ui/section-header"
import { HOW_IT_WORKS_STEPS } from "@/lib/constants"
import type { HowItWorksStep } from "@/lib/types"

const iconMap = {
  package: Package,
  truck: Truck,
  flame: Flame,
  sparkles: Sparkles,
  check: CheckCircle2,
}

function StepCard({ step, isLast }: { step: HowItWorksStep; isLast: boolean }) {
  const Icon = iconMap[step.icon]

  return (
    <div className="relative flex flex-col items-center text-center group">
      {/* Step Number & Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
          <Icon size={32} className="text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
          {step.step}
        </div>
      </div>

      {/* Content */}
      <h3 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-foreground mb-3">{step.title}</h3>
      <p className="text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>

      {/* Connector Line (Desktop) */}
      {!isLast && (
        <div className="hidden lg:block absolute top-10 left-[60%] w-[calc(100%-20%)] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
      )}
    </div>
  )
}

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <SectionHeader
          title='O Fim do "Quem vai no mercado?"'
          subtitle="Em 5 passos simples, sua resenha sai do zero à perfeição. Você só precisa curtir."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-6">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <StepCard key={step.step} step={step} isLast={index === HOW_IT_WORKS_STEPS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
