"use client"

import { Flame } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-primary/20 via-background to-primary/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary">
            <Flame size={20} className="animate-ember" />
            <span className="font-medium">A brasa está acesa</span>
          </div>

          <h2 className="font-[family-name:var(--font-bebas)] text-4xl md:text-5xl lg:text-6xl tracking-wide text-foreground">
            Pronto para a melhor resenha
            <br />
            <span className="text-gradient">da sua vida?</span>
          </h2>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Junte os amigos, escolha o combo e deixe que a gente cuida do resto. A única coisa que você precisa fazer é
            virar a carne.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-10 py-7 animate-glow"
            >
              QUERO MINHA RESENHA AGORA
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-secondary font-semibold text-lg px-10 py-7 bg-transparent"
            >
              Falar no WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
