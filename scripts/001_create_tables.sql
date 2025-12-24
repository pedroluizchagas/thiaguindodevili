-- Quem Fez, Fez! ERP Database Schema
-- Following Clean Architecture principles with proper RLS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'driver')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  neighborhood TEXT,
  city TEXT DEFAULT 'São Paulo',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coolers (Asset Tracking)
CREATE TABLE IF NOT EXISTS public.coolers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'lost')),
  capacity TEXT DEFAULT 'standard',
  last_maintenance TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table (Kanban)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number SERIAL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  cooler_id UUID REFERENCES public.coolers(id) ON DELETE SET NULL,
  
  -- Order details
  guests_count INTEGER NOT NULL DEFAULT 10,
  meat_type TEXT NOT NULL,
  meat_weight NUMERIC(10,2) NOT NULL,
  beverages JSONB DEFAULT '[]',
  services JSONB DEFAULT '[]',
  sides JSONB DEFAULT '[]',
  
  -- Pricing
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  
  -- Scheduling
  delivery_date DATE NOT NULL,
  delivery_time TEXT NOT NULL,
  pickup_date DATE,
  pickup_time TEXT,
  
  -- Address
  delivery_address TEXT NOT NULL,
  delivery_neighborhood TEXT,
  delivery_city TEXT DEFAULT 'São Paulo',
  
  -- Status (Kanban columns)
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new',           -- Novo Pedido
    'picking',       -- Montagem do Cooler
    'in_route',      -- Em Rota de Entrega
    'delivered',     -- No Local (Churrasqueira Acesa)
    'consuming',     -- Consumo
    'scheduled_pickup', -- Agendado Recolhimento
    'collected',     -- Cooler Recolhido
    'completed'      -- Higienizado e Finalizado
  )),
  
  -- Tracking
  assigned_driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  delivered_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ,
  
  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,
  
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order history/timeline
CREATE TABLE IF NOT EXISTS public.order_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON public.orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_coolers_status ON public.coolers(status);
CREATE INDEX IF NOT EXISTS idx_coolers_qr_code ON public.coolers(qr_code);
