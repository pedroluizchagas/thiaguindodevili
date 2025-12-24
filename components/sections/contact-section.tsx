"use client"

import type React from "react"

import { useState } from "react"
import { Send, MessageCircle, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/ui/section-header"
import { COMPANY_INFO } from "@/lib/constants"
import { cn } from "@/lib/utils"

type ContactType = "customer" | "franchise"

export function ContactSection() {
  const [contactType, setContactType] = useState<ContactType>("customer")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    // Reset form
    e.currentTarget.reset()
  }

  return (
    <section id="contato" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Fale Conosco"
          subtitle="Tire suas dúvidas, faça seu pedido ou saiba mais sobre nossas franquias."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="bg-background rounded-2xl p-8 border border-border">
            {/* Type Selector */}
            <div className="flex gap-4 mb-8">
              <button
                type="button"
                onClick={() => setContactType("customer")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg font-medium transition-all",
                  contactType === "customer"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80",
                )}
              >
                Quero Pedir
              </button>
              <button
                type="button"
                onClick={() => setContactType("franchise")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg font-medium transition-all",
                  contactType === "franchise"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80",
                )}
              >
                Quero Franquia
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {contactType === "franchise" && (
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                    Cidade de interesse
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Cidade / Estado"
                  />
                </div>
              )}

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder={
                    contactType === "customer"
                      ? "Conte-nos sobre sua resenha ideal..."
                      : "Conte-nos sobre seu interesse em ser franqueado..."
                  }
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send size={18} />
                    Enviar Mensagem
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-foreground mb-6">
                Prefere um contato direto?
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Nossa equipe está pronta para atender você. Escolha o canal de sua preferência e vamos conversar sobre
                sua próxima resenha ou oportunidade de franquia.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              <a
                href={COMPANY_INFO.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors group"
              >
                <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={28} className="text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">WhatsApp</p>
                  <p className="text-muted-foreground">{COMPANY_INFO.phone}</p>
                </div>
              </a>

              <a
                href={`tel:${COMPANY_INFO.phone.replace(/\D/g, "")}`}
                className="flex items-center gap-4 p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Phone size={28} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Telefone</p>
                  <p className="text-muted-foreground">{COMPANY_INFO.phone}</p>
                </div>
              </a>

              <a
                href={`mailto:${COMPANY_INFO.email}`}
                className="flex items-center gap-4 p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors group"
              >
                <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Mail size={28} className="text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">E-mail</p>
                  <p className="text-muted-foreground">{COMPANY_INFO.email}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
