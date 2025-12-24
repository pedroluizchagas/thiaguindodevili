"use client"

import Image from "next/image"
import { Star, Quote } from "lucide-react"
import { SectionHeader } from "@/components/ui/section-header"
import { TESTIMONIALS } from "@/lib/constants"
import type { Testimonial } from "@/lib/types"

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-colors group">
      {/* Quote Icon */}
      <Quote size={32} className="text-primary/30 mb-4" />

      {/* Content */}
      <p className="text-foreground text-lg leading-relaxed mb-6">{`"${testimonial.content}"`}</p>

      {/* Rating */}
      <div className="flex gap-1 mb-6">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} size={18} className="fill-accent text-accent" />
        ))}
      </div>

      {/* Author */}
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/30">
          <Image src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} fill className="object-cover" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="O Que Dizem Nossos Clientes"
          subtitle="Histórias reais de resenhas inesquecíveis. A satisfação de quem já viveu a experiência."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}
