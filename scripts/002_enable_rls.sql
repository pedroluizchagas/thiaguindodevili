-- Enable Row Level Security on all tables

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coolers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;

-- Profiles policies (users can read all profiles, update own)
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Customers policies (authenticated users can CRUD)
CREATE POLICY "customers_select" ON public.customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "customers_insert" ON public.customers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "customers_update" ON public.customers
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "customers_delete" ON public.customers
  FOR DELETE TO authenticated USING (true);

-- Coolers policies (authenticated users can CRUD)
CREATE POLICY "coolers_select" ON public.coolers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "coolers_insert" ON public.coolers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "coolers_update" ON public.coolers
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "coolers_delete" ON public.coolers
  FOR DELETE TO authenticated USING (true);

-- Orders policies (authenticated users can CRUD)
CREATE POLICY "orders_select" ON public.orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "orders_insert" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "orders_update" ON public.orders
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "orders_delete" ON public.orders
  FOR DELETE TO authenticated USING (true);

-- Order timeline policies
CREATE POLICY "order_timeline_select" ON public.order_timeline
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "order_timeline_insert" ON public.order_timeline
  FOR INSERT TO authenticated WITH CHECK (true);
