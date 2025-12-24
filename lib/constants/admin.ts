// Admin/ERP Constants following Single Responsibility Principle

import type { OrderStatus } from "@/lib/types/admin"

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  new: {
    label: "Novo Pedido",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  picking: {
    label: "Montagem",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
  },
  in_route: {
    label: "Em Rota",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
  },
  delivered: {
    label: "Entregue",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
  },
  consuming: {
    label: "Consumindo",
    color: "text-primary",
    bgColor: "bg-primary/20",
  },
  scheduled_pickup: {
    label: "Ag. Recolhimento",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
  collected: {
    label: "Recolhido",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
  },
  completed: {
    label: "Finalizado",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
}

export const KANBAN_COLUMNS: OrderStatus[] = [
  "new",
  "picking",
  "in_route",
  "delivered",
  "consuming",
  "scheduled_pickup",
  "collected",
  "completed",
]

export const COOLER_STATUS_CONFIG = {
  available: { label: "Disponível", color: "text-green-400", bgColor: "bg-green-500/20" },
  in_use: { label: "Em Uso", color: "text-blue-400", bgColor: "bg-blue-500/20" },
  maintenance: { label: "Manutenção", color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
  lost: { label: "Perdido", color: "text-red-400", bgColor: "bg-red-500/20" },
}

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "home" },
  { label: "Pedidos", href: "/admin/orders", icon: "clipboard" },
  { label: "Coolers", href: "/admin/coolers", icon: "box" },
  { label: "Clientes", href: "/admin/customers", icon: "users" },
]
