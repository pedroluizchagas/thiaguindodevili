"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Play } from "lucide-react"
import Image from "next/image"

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video Placeholder */}
      <div className="absolute inset-0 z-0">
        <Image src="/bbq-grill-with-flames-smoke-premium-meat-dark-mood.jpg" alt="Churrasco premium" fill className="object-cover" priority />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-radial" />
      </div>

      {/* Ember particles effect */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-ember"
            style={{
              left: `${pseudoRandom(i * 31 + 1) * 100}%`,
              top: `${pseudoRandom(i * 31 + 2) * 100}%`,
              animationDelay: `${pseudoRandom(i * 31 + 3) * 2}s`,
              opacity: pseudoRandom(i * 31 + 4) * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-20 text-center pt-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary mb-4">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium">Franquias disponíveis em todo Brasil</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-[family-name:var(--font-bebas)] text-5xl md:text-7xl lg:text-8xl tracking-tight leading-none">
            <span className="block text-foreground">Você só tem</span>
            <span className="block text-gradient">um trabalho:</span>
            <span className="block text-foreground">virar a carne.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A resenha completa, do gelo à brasa acesa, entregue na sua porta. Esqueça o mercado, o saco de carvão pesado
            e a luta para acender o fogo.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-6 animate-glow"
            >
              QUERO MINHA RESENHA PRONTA AGORA
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-secondary font-semibold text-lg px-8 py-6 group bg-transparent"
            >
              <Play size={20} className="mr-2 group-hover:text-primary transition-colors" />
              Ver Como Funciona
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">500+</span>
              <span className="text-sm text-left leading-tight">
                Resenhas
                <br />
                realizadas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">4.9</span>
              <span className="text-sm text-left leading-tight">
                Avaliação
                <br />
                média
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">15+</span>
              <span className="text-sm text-left leading-tight">
                Cidades
                <br />
                atendidas
              </span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={32} className="text-primary" />
        </div>
      </div>
    </section>
  )
}
