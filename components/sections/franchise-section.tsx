"use client"

import Image from "next/image"
import { Check, TrendingUp, Users, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FRANCHISE_BENEFITS } from "@/lib/constants"

export function FranchiseSection() {
  return (
    <section id="franquias" className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/grill-pattern-texture.jpg')] bg-repeat" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-medium">
              <TrendingUp size={16} />
              Oportunidade de Negócio
            </div>

            <h2 className="font-[family-name:var(--font-bebas)] text-4xl md:text-5xl lg:text-6xl tracking-wide text-foreground">
              Seja um Franqueado
              <br />
              <span className="text-gradient">Quem Fez, Fez!</span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed">
              Faça parte da revolução do churrasco brasileiro. Um modelo de negócio inovador, com baixo investimento
              inicial e alta rentabilidade.
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FRANCHISE_BENEFITS.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-primary" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <MapPin size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">50+</p>
                  <p className="text-sm text-muted-foreground">Cidades disponíveis</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Users size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">25</p>
                  <p className="text-sm text-muted-foreground">Franqueados ativos</p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 py-6"
            >
              Quero Ser Franqueado
            </Button>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image src="/successful-brazilian-businessman-bbq-restaurant-ow.jpg" alt="Franqueado Quem Fez, Fez!" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-6 shadow-xl">
              <p className="text-sm text-muted-foreground mb-1">ROI médio</p>
              <p className="text-3xl font-bold text-primary">18 meses</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
