-- Seed some initial coolers for testing
INSERT INTO public.coolers (qr_code, status, capacity, notes) VALUES
  ('QFF-001', 'available', 'standard', 'Cooler padrão 45L'),
  ('QFF-002', 'available', 'standard', 'Cooler padrão 45L'),
  ('QFF-003', 'available', 'large', 'Cooler grande 65L'),
  ('QFF-004', 'available', 'standard', 'Cooler padrão 45L'),
  ('QFF-005', 'maintenance', 'standard', 'Em manutenção - tampa quebrada'),
  ('QFF-006', 'available', 'large', 'Cooler grande 65L'),
  ('QFF-007', 'available', 'standard', 'Cooler padrão 45L'),
  ('QFF-008', 'available', 'standard', 'Cooler padrão 45L')
ON CONFLICT (qr_code) DO NOTHING;
