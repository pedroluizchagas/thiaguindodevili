# 03 — Banco de Dados

> Schema Supabase, tabelas, relacionamentos, RLS, migrations e boas práticas.

---

## Visão Geral

O banco de dados é **PostgreSQL 15** gerenciado pelo Supabase. Utiliza Row Level Security (RLS) para controle de acesso granular. O schema fica no namespace `public`.

**Extensões ativas:**
- `uuid-ossp` — geração de UUIDs v4

---

## Diagrama de Entidades

```
auth.users (Supabase managed)
    │
    │ 1:1 (trigger on_auth_user_created)
    ▼
public.profiles
    │ assigned_driver_id (1:N)
    │ created_by (1:N)
    ▼
public.orders ──────────── public.customers (customer_id, N:1)
    │               │
    │ 1:N           └───── public.coolers (cooler_id, N:1)
    ▼
public.order_timeline
```

---

## Tabelas

### `public.profiles`
Perfil interno dos usuários do sistema (admin, operador, motorista). Vinculado a `auth.users`.

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `UUID` | PK, FK → auth.users | Mesmo ID do auth |
| `full_name` | `TEXT` | NOT NULL | Nome completo |
| `role` | `TEXT` | NOT NULL, CHECK | `admin` \| `operator` \| `driver` |
| `phone` | `TEXT` | nullable | Telefone |
| `avatar_url` | `TEXT` | nullable | URL do avatar |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | auto-updated via trigger |

---

### `public.customers`
Clientes que realizam pedidos (criados automaticamente pela API pública).

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT uuid_generate_v4() | |
| `name` | `TEXT` | NOT NULL | Nome |
| `email` | `TEXT` | nullable | Email (opcional no pedido) |
| `phone` | `TEXT` | NOT NULL | WhatsApp (usado como identificador único) |
| `address` | `TEXT` | nullable | Endereço principal |
| `neighborhood` | `TEXT` | nullable | Bairro |
| `city` | `TEXT` | DEFAULT 'São Paulo' | Cidade |
| `notes` | `TEXT` | nullable | Observações internas |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

**Regra de negócio:** o campo `phone` é usado para identificar clientes recorrentes. A API `POST /api/orders` busca por `phone` antes de inserir — se existir, atualiza; se não, cria.

---

### `public.coolers`
Inventário de coolers (ativos rastreados por QR code).

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `qr_code` | `TEXT` | UNIQUE NOT NULL | Código do QR (ex: `QFF-001`) |
| `status` | `TEXT` | NOT NULL, CHECK | `available` \| `in_use` \| `maintenance` \| `lost` |
| `capacity` | `TEXT` | DEFAULT 'standard' | Capacidade (standard, large) |
| `last_maintenance` | `TIMESTAMPTZ` | nullable | Data da última manutenção |
| `notes` | `TEXT` | nullable | Observações |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

---

### `public.orders`
Pedido central do sistema — núcleo do negócio.

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `order_number` | `SERIAL` | auto-increment | Número legível do pedido |
| `customer_id` | `UUID` | FK → customers, ON DELETE SET NULL | Cliente |
| `cooler_id` | `UUID` | FK → coolers, ON DELETE SET NULL | Cooler alocado |
| `guests_count` | `INTEGER` | NOT NULL | Número de pessoas |
| `meat_type` | `TEXT` | NOT NULL | Nome do kit de carne |
| `meat_weight` | `NUMERIC(10,2)` | NOT NULL | Peso total em kg |
| `beverages` | `JSONB` | DEFAULT '[]' | Array de `{ id, name, category, quantity, pricePerUnit, total }` |
| `services` | `JSONB` | DEFAULT '[]' | Array de `{ id, name, price }` |
| `sides` | `JSONB` | DEFAULT '[]' | Array de `{ id, name, price }` |
| `subtotal` | `NUMERIC(10,2)` | NOT NULL | Subtotal calculado |
| `discount` | `NUMERIC(10,2)` | DEFAULT 0 | Desconto aplicado manualmente |
| `total` | `NUMERIC(10,2)` | NOT NULL | `subtotal - discount` |
| `delivery_date` | `DATE` | NOT NULL | Data de entrega |
| `delivery_time` | `TEXT` | NOT NULL | Hora da entrega (HH:MM) |
| `pickup_date` | `DATE` | nullable | Data do recolhimento |
| `pickup_time` | `TEXT` | nullable | Hora do recolhimento |
| `delivery_address` | `TEXT` | NOT NULL | Endereço completo de entrega |
| `delivery_neighborhood` | `TEXT` | nullable | Bairro |
| `delivery_city` | `TEXT` | DEFAULT 'São Paulo' | Cidade |
| `status` | `TEXT` | NOT NULL, CHECK | Ver status do pedido em `01-visao-e-produto.md` |
| `assigned_driver_id` | `UUID` | FK → profiles | Motorista/operador responsável |
| `delivered_at` | `TIMESTAMPTZ` | nullable | Timestamp da entrega |
| `collected_at` | `TIMESTAMPTZ` | nullable | Timestamp da coleta |
| `customer_notes` | `TEXT` | nullable | Observações do cliente |
| `internal_notes` | `TEXT` | nullable | Notas internas do operador |
| `created_by` | `UUID` | FK → profiles | Quem criou (null = pedido via site) |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

---

### `public.order_timeline`
Histórico de mudanças de status de um pedido (auditoria).

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `order_id` | `UUID` | FK → orders, ON DELETE CASCADE | Pedido |
| `status` | `TEXT` | NOT NULL | Status registrado |
| `notes` | `TEXT` | nullable | Anotação da mudança |
| `created_by` | `UUID` | FK → profiles | Quem fez a mudança |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

---

## Indexes

```sql
CREATE INDEX idx_orders_status        ON public.orders(status);
CREATE INDEX idx_orders_delivery_date ON public.orders(delivery_date);
CREATE INDEX idx_orders_customer      ON public.orders(customer_id);
CREATE INDEX idx_coolers_status       ON public.coolers(status);
CREATE INDEX idx_coolers_qr_code      ON public.coolers(qr_code);
```

**Indexes a adicionar (Fase 2):**
```sql
-- Para relatórios de receita por período
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
-- Para buscar clientes por telefone (muito usado na API)
CREATE INDEX idx_customers_phone ON public.customers(phone);
```

---

## Triggers

### `on_auth_user_created`
Cria automaticamente um `profile` quando um novo usuário é registrado no Supabase Auth.

```sql
-- Função: public.handle_new_user()
-- Trigger: AFTER INSERT ON auth.users
-- Usa raw_user_meta_data para preencher full_name, role e phone
```

### `update_*_updated_at`
Atualiza `updated_at = NOW()` automaticamente em `profiles`, `customers`, `coolers` e `orders`.

### `track_order_status`
Registra uma entrada em `order_timeline` sempre que `orders.status` muda.

---

## Row Level Security (RLS)

### Estado atual (Fase 1 — básico)
Todas as tabelas têm RLS habilitado. As políticas atuais permitem qualquer operação para usuários `authenticated`. É funcional mas **sem granularidade por role**.

### Estado alvo (Fase 2 — granular por role)

```sql
-- Pedidos: admin e operator podem tudo; driver só lê e atualiza status
CREATE POLICY "orders_admin_operator_all" ON public.orders
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'operator')
    )
  );

CREATE POLICY "orders_driver_select" ON public.orders
  FOR SELECT TO authenticated
  USING (
    assigned_driver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'operator')
    )
  );

-- Profiles: admin pode ver e editar todos; outros só o próprio
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Customers: autenticados podem criar; admin/operator podem editar
-- Coolers: apenas admin pode deletar; operator pode atualizar status
```

> Ver implementação completa em [04-autenticacao-e-seguranca.md](./04-autenticacao-e-seguranca.md).

---

## Migrations

### Workflow de migrations
1. Criar novo arquivo `scripts/00N_descricao.sql` com número sequencial
2. Testar localmente com `supabase db push` (se usando CLI local)
3. Aplicar no ambiente de staging antes da produção
4. Nunca editar um migration já aplicado — sempre criar novo

### Scripts existentes
| Arquivo | Descrição |
|---|---|
| `001_create_tables.sql` | Cria todas as tabelas e indexes |
| `002_enable_rls.sql` | Habilita RLS e políticas básicas |
| `003_create_triggers.sql` | Triggers de updated_at e timeline |
| `004_seed_coolers.sql` | Dados iniciais de coolers |

### Próximos migrations planejados
| Arquivo | Descrição | Fase |
|---|---|---|
| `005_add_customer_phone_index.sql` | Index em customers.phone | 2 |
| `006_add_orders_created_at_index.sql` | Index em orders.created_at | 2 |
| `007_rls_granular_by_role.sql` | Políticas RLS por role | 2 |
| `008_add_product_catalog_table.sql` | Tabela de catálogo editável pelo admin | 3 |
| `009_add_push_tokens_table.sql` | Tokens push para notificações mobile | 3 |

---

## Tipos TypeScript (gerados pelo Supabase)

O Supabase CLI gera tipos a partir do schema:

```bash
supabase gen types typescript --project-id <PROJECT_ID> > packages/supabase/database.types.ts
```

Este arquivo deve ser regenerado após cada migration e commitado no repositório. Os tipos manuais em `lib/types/` devem gradualmente ser substituídos ou derivados dos tipos gerados.

---

## Boas Práticas

1. **Nunca usar `SUPABASE_SERVICE_ROLE_KEY` em contexto que não seja server-side** — a service role bypassa RLS completamente.
2. **Testar RLS localmente** com usuários de diferentes roles antes de aplicar em produção.
3. **JSONB para arrays** (`beverages`, `services`, `sides`) é correto para dados que não precisam de queries complexas. Se futuramente precisar de filtros por beverage, criar tabela relacional.
4. **Backups automáticos** estão habilitados no Supabase Pro — verificar configuração no painel.
5. **Migrations idempotentes** — usar `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`.
