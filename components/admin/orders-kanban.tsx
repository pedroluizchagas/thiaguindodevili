"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { ORDER_STATUS_CONFIG, KANBAN_COLUMNS } from "@/lib/constants/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, Users, ChevronRight, Phone, Beef } from "lucide-react"
import type { KanbanColumn, Order, OrderStatus } from "@/lib/types/admin"
import { useRouter } from "next/navigation"

interface OrdersKanbanProps {
  initialColumns: KanbanColumn[]
}

export function OrdersKanban({ initialColumns }: OrdersKanbanProps) {
  const [columns, setColumns] = useState(initialColumns)
  const [draggedOrder, setDraggedOrder] = useState<Order | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const router = useRouter()

  const handleDragStart = (e: React.DragEvent, order: Order) => {
    setDraggedOrder(order)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetStatus: OrderStatus) => {
      e.preventDefault()

      if (!draggedOrder || draggedOrder.status === targetStatus) {
        setDraggedOrder(null)
        return
      }

      const supabase = createClient()

      // Optimistic update
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === draggedOrder.status) {
            return { ...col, orders: col.orders.filter((o) => o.id !== draggedOrder.id) }
          }
          if (col.id === targetStatus) {
            return { ...col, orders: [...col.orders, { ...draggedOrder, status: targetStatus }] }
          }
          return col
        }),
      )

      // Update in database
      const { error } = await supabase.from("orders").update({ status: targetStatus }).eq("id", draggedOrder.id)

      if (error) {
        // Revert on error
        router.refresh()
      }

      setDraggedOrder(null)
    },
    [draggedOrder, router],
  )

  const moveOrder = async (order: Order, direction: "next" | "prev") => {
    const currentIndex = KANBAN_COLUMNS.indexOf(order.status)
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1

    if (newIndex < 0 || newIndex >= KANBAN_COLUMNS.length) return

    const newStatus = KANBAN_COLUMNS[newIndex]
    const supabase = createClient()

    // Optimistic update
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === order.status) {
          return { ...col, orders: col.orders.filter((o) => o.id !== order.id) }
        }
        if (col.id === newStatus) {
          return { ...col, orders: [...col.orders, { ...order, status: newStatus }] }
        }
        return col
      }),
    )

    await supabase.from("orders").update({ status: newStatus }).eq("id", order.id)
    setSelectedOrder(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
      {columns.map((column) => {
        const config = ORDER_STATUS_CONFIG[column.id]
        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-72"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <Card className="bg-card/30 border-border/50 h-full">
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className={config.color}>{config.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {column.orders.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-2 min-h-[400px]">
                {column.orders.map((order) => (
                  <Dialog key={order.id}>
                    <DialogTrigger asChild>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, order)}
                        onClick={() => setSelectedOrder(order)}
                        className="p-3 rounded-lg bg-background/80 border border-border/50 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-foreground">#{order.order_number}</span>
                          <span className="text-xs text-muted-foreground">
                            R$ {Number(order.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <p className="text-sm text-foreground truncate mb-2">
                          {order.customer?.name || "Cliente não informado"}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.delivery_date).toLocaleDateString("pt-BR")}
                          <Clock className="h-3 w-3 ml-1" />
                          {order.delivery_time}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Users className="h-3 w-3" />
                          {order.guests_count} pessoas
                          <Beef className="h-3 w-3 ml-1" />
                          {order.meat_weight}kg
                        </div>
                      </div>
                    </DialogTrigger>

                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Pedido #{order.order_number}</DialogTitle>
                        <DialogDescription>Detalhes do pedido e ações rápidas</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <h4 className="font-medium text-foreground mb-2">Cliente</h4>
                          <p className="text-sm text-foreground">{order.customer?.name || "Não informado"}</p>
                          {order.customer?.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Phone className="h-3 w-3" />
                              {order.customer.phone}
                            </div>
                          )}
                        </div>

                        <div className="p-3 rounded-lg bg-muted/50">
                          <h4 className="font-medium text-foreground mb-2">Entrega</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.delivery_date).toLocaleDateString("pt-BR")} às {order.delivery_time}
                          </div>
                          <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mt-0.5" />
                            <span>
                              {order.delivery_address}
                              {order.delivery_neighborhood && `, ${order.delivery_neighborhood}`}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/50">
                          <h4 className="font-medium text-foreground mb-2">Pedido</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Pessoas:</span>{" "}
                              <span className="text-foreground">{order.guests_count}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Carne:</span>{" "}
                              <span className="text-foreground">{order.meat_weight}kg</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tipo:</span>{" "}
                              <span className="text-foreground">{order.meat_type}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total:</span>{" "}
                              <span className="text-primary font-semibold">
                                R$ {Number(order.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {order.cooler && (
                          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                            <h4 className="font-medium text-foreground mb-1">Cooler Vinculado</h4>
                            <p className="text-sm font-mono text-primary">{order.cooler.qr_code}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {KANBAN_COLUMNS.indexOf(order.status) > 0 && (
                            <Button
                              variant="outline"
                              className="flex-1 bg-transparent"
                              onClick={() => moveOrder(order, "prev")}
                            >
                              Voltar Status
                            </Button>
                          )}
                          {KANBAN_COLUMNS.indexOf(order.status) < KANBAN_COLUMNS.length - 1 && (
                            <Button className="flex-1 bg-primary" onClick={() => moveOrder(order, "next")}>
                              Avançar <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}

                {column.orders.length === 0 && (
                  <div className="h-20 flex items-center justify-center text-sm text-muted-foreground border border-dashed border-border/50 rounded-lg">
                    Nenhum pedido
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
