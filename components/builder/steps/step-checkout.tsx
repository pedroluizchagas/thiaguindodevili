"use client"

import type React from "react"

import { useState } from "react"
import { useBuilderContext } from "../builder-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Check, Users, Beef, Beer, Sparkles, UtensilsCrossed, Calendar, MapPin, Phone, User } from "lucide-react"
import { COMPANY_INFO } from "@/lib/constants"

export function StepCheckout() {
  const { state, summary, calculateTotal } = useBuilderContext()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    address: "",
    date: "",
    time: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdOrderNumber, setCreatedOrderNumber] = useState<number | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    if (!state.selectedMeat) {
      setIsSubmitting(false)
      setSubmitError("Selecione um kit de carnes antes de agendar.")
      return
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData,
          selection: {
            guests: state.guests,
            meatId: state.selectedMeat.id,
            beverages: state.selectedBeverages.map((b) => ({ id: b.option.id, quantity: b.quantity })),
            services: state.selectedServices.map((s) => s.id),
            accompaniments: state.selectedAccompaniments.map((a) => a.id),
          },
        }),
      })

      const data = (await response.json().catch(() => null)) as { error?: string; orderNumber?: number } | null

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível criar o agendamento. Tente novamente.")
      }

      setCreatedOrderNumber(data?.orderNumber ?? null)
      setIsSuccess(true)

      setTimeout(() => {
        const orderLine = data?.orderNumber ? `Pedido: #${data.orderNumber}\n` : ""
        const message = encodeURIComponent(
          `Olá! Gostaria de agendar minha resenha:\n\n` +
            orderLine +
            `Nome: ${formData.name}\n` +
            `Pessoas: ${summary.guests}\n` +
            `Kit: ${summary.meatKit}\n` +
            `Bebidas: ${summary.beverages.join(", ") || "Nenhuma"}\n` +
            `Serviços: ${summary.services.join(", ") || "Nenhum"}\n` +
            `Acompanhamentos: ${summary.accompaniments.join(", ") || "Nenhum"}\n` +
            `Total: ${formatCurrency(calculateTotal)}\n\n` +
            `Data: ${formData.date}\n` +
            `Horário: ${formData.time}\n` +
            `Endereço: ${formData.address}`,
        )
        window.open(`${COMPANY_INFO.whatsapp}?text=${message}`, "_blank")
      }, 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível criar o agendamento. Tente novamente."
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-display text-foreground">Resumo da sua Resenha</h2>
        <p className="text-muted-foreground">Confira todos os detalhes antes de finalizar</p>
      </div>

      {/* Receipt Style Summary */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-primary/10 p-6 text-center border-b border-border">
          <h3 className="font-display text-2xl text-primary">Quem Fez, Fez!</h3>
          <p className="text-sm text-muted-foreground">Nota de Pedido</p>
        </div>

        {/* Items */}
        <div className="p-6 space-y-4">
          {/* Guests */}
          <div className="flex items-center justify-between py-2 border-b border-dashed border-border">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Pessoas</span>
            </div>
            <span className="font-bold text-foreground">{summary.guests}</span>
          </div>

          {/* Meat Kit */}
          <div className="flex items-center justify-between py-2 border-b border-dashed border-border">
            <div className="flex items-center gap-3">
              <Beef className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{summary.meatKit}</span>
            </div>
            <span className="font-bold text-primary">
              {state.selectedMeat ? formatCurrency(state.selectedMeat.pricePerPerson * state.guests) : "-"}
            </span>
          </div>

          {/* Beverages */}
          {summary.beverages.length > 0 && (
            <div className="py-2 border-b border-dashed border-border">
              <div className="flex items-center gap-3 mb-2">
                <Beer className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground font-medium">Bebidas</span>
              </div>
              {state.selectedBeverages.map((b) => (
                <div key={b.option.id} className="flex justify-between text-sm pl-8">
                  <span className="text-muted-foreground">
                    {b.quantity}x {b.option.name}
                  </span>
                  <span className="text-foreground">{formatCurrency(b.option.pricePerUnit * b.quantity)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Services */}
          {summary.services.length > 0 && (
            <div className="py-2 border-b border-dashed border-border">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground font-medium">Serviços</span>
              </div>
              {state.selectedServices.map((s) => (
                <div key={s.id} className="flex justify-between text-sm pl-8">
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="text-foreground">{formatCurrency(s.price)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Accompaniments */}
          {summary.accompaniments.length > 0 && (
            <div className="py-2 border-b border-dashed border-border">
              <div className="flex items-center gap-3 mb-2">
                <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground font-medium">Acompanhamentos</span>
              </div>
              {state.selectedAccompaniments.map((a) => (
                <div key={a.id} className="flex justify-between text-sm pl-8">
                  <span className="text-muted-foreground">{a.name}</span>
                  <span className="text-foreground">{formatCurrency(a.price)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-foreground">Total</span>
              <span className="text-3xl font-display text-primary">{formatCurrency(calculateTotal)}</span>
            </div>
            <p className="text-sm text-muted-foreground text-right mt-1">
              ou 3x de {formatCurrency(calculateTotal / 3)}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 bg-muted/30">
          <Button
            size="lg"
            className="w-full text-lg font-bold h-14"
            onClick={() => setIsDialogOpen(true)}
            disabled={!state.selectedMeat}
          >
            AGENDAR MINHA EXPERIÊNCIA
          </Button>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (open) {
            setIsSuccess(false)
            setSubmitError(null)
            setCreatedOrderNumber(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Agendar Resenha</DialogTitle>
            <DialogDescription>Preencha seus dados para finalizar o agendamento</DialogDescription>
          </DialogHeader>

          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Pedido Enviado!</h3>
              {createdOrderNumber && <p className="text-sm text-muted-foreground">Pedido #{createdOrderNumber}</p>}
              <p className="text-muted-foreground">
                Você será redirecionado para o WhatsApp para confirmar os detalhes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome completo
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Endereço de entrega
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, número, bairro"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              {submitError && <p className="text-sm text-destructive">{submitError}</p>}

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Confirmar Agendamento"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
