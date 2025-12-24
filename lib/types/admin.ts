// Admin/ERP Type definitions following Interface Segregation Principle

export type UserRole = "admin" | "operator" | "driver"

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string
  address: string | null
  neighborhood: string | null
  city: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type CoolerStatus = "available" | "in_use" | "maintenance" | "lost"

export interface Cooler {
  id: string
  qr_code: string
  status: CoolerStatus
  capacity: string
  last_maintenance: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type OrderStatus =
  | "new"
  | "picking"
  | "in_route"
  | "delivered"
  | "consuming"
  | "scheduled_pickup"
  | "collected"
  | "completed"

export interface Order {
  id: string
  order_number: number
  customer_id: string | null
  cooler_id: string | null
  guests_count: number
  meat_type: string
  meat_weight: number
  beverages: BeverageItem[]
  services: string[]
  sides: string[]
  subtotal: number
  discount: number
  total: number
  delivery_date: string
  delivery_time: string
  pickup_date: string | null
  pickup_time: string | null
  delivery_address: string
  delivery_neighborhood: string | null
  delivery_city: string
  status: OrderStatus
  assigned_driver_id: string | null
  delivered_at: string | null
  collected_at: string | null
  customer_notes: string | null
  internal_notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined data
  customer?: Customer
  cooler?: Cooler
  assigned_driver?: Profile
}

export interface BeverageItem {
  type: string
  quantity: number
}

export interface OrderTimelineEntry {
  id: string
  order_id: string
  status: OrderStatus
  notes: string | null
  created_by: string | null
  created_at: string
  profile?: Profile
}

export interface KanbanColumn {
  id: OrderStatus
  title: string
  color: string
  orders: Order[]
}

// Dashboard statistics
export interface DashboardStats {
  totalOrders: number
  todayOrders: number
  pendingOrders: number
  revenue: number
  availableCoolers: number
  totalCoolers: number
}
