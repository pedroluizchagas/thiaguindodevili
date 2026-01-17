"use client"

import { useEffect, useState } from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { Button } from "@/components/ui/button"
import { ResenhaBuilder } from "@/components/builder/resenha-builder"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Flame, Clock, Sparkles } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export function BuilderSection() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)

  useEffect(() => {
    const handleOpen = () => setIsBuilderOpen(true)
    window.addEventListener("qff:open-builder", handleOpen)
    return () => window.removeEventListener("qff:open-builder", handleOpen)
  }, [])

  const features = [
    {
      icon: Clock,
      title: "5 Passos Rápidos",
      description: "Monte sua resenha em menos de 2 minutos",
    },
    {
      icon: Flame,
      title: "Preço em Tempo Real",
      description: "Veja o total atualizar conforme suas escolhas",
    },
    {
      icon: Sparkles,
      title: "Recomendações Inteligentes",
      description: "Calculamos tudo para você não ter surpresas",
    },
  ]

  return (
    <section id="monte-sua-resenha" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-radial opacity-50" />

      <div className="container relative z-10">
        <SectionHeader
          badge="Auto Atendimento"
          title="Monte Sua Resenha"
          description="Personalize cada detalhe do seu churrasco perfeito. Escolha carnes, bebidas, serviços e acompanhamentos em poucos cliques."
        />

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center p-6 bg-card rounded-xl border border-border"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => setIsBuilderOpen(true)}
            className="text-lg px-12 h-16 font-bold animate-glow"
          >
            <Flame className="w-5 h-5 mr-2" />
            COMEÇAR A MONTAR
          </Button>
        </div>
      </div>

      {/* Builder Modal */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-5xl h-[90vh] overflow-y-auto p-0">
          <VisuallyHidden>
            <DialogTitle>Monte Sua Resenha</DialogTitle>
          </VisuallyHidden>
          <ResenhaBuilder />
        </DialogContent>
      </Dialog>
    </section>
  )
}
