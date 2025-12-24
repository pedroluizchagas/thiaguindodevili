"use client"

import Image from "next/image"
import { SectionHeader } from "@/components/ui/section-header"
import { DIFFERENTIALS } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function DifferentialsSection() {
  return (
    <section id="diferenciais" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Por que a Quem Fez, Fez! é diferente?"
          subtitle="Não somos apenas delivery. Somos a experiência completa do churrasco perfeito."
        />

        <div className="space-y-24">
          {DIFFERENTIALS.map((item, index) => (
            <div
              key={item.title}
              className={cn(
                "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center",
                index % 2 === 1 && "lg:flex-row-reverse",
              )}
            >
              {/* Image */}
              <div className={cn("relative", index % 2 === 1 && "lg:order-2")}>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/20 rounded-2xl -z-10" />
                <div className="absolute -top-4 -left-4 w-16 h-16 border-2 border-primary/30 rounded-2xl -z-10" />
              </div>

              {/* Content */}
              <div className={cn("space-y-6", index % 2 === 1 && "lg:order-1")}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                  Diferencial #{index + 1}
                </div>
                <h3 className="font-[family-name:var(--font-bebas)] text-4xl md:text-5xl tracking-wide text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{item.description}</p>
                {index === 0 && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {["Angus", "Wagyu", "Duroc", "In Natura"].map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-secondary rounded-full text-sm text-foreground border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
