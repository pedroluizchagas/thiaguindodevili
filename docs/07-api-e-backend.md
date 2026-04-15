# 07 — API e Backend

> Rotas de API, contratos de request/response, validação, tratamento de erros e padrões.

---

## Visão Geral

O backend é composto por **Next.js API Routes** (App Router) que servem como camada intermediária entre o cliente e o Supabase. O Supabase também é acessado diretamente em Server Components para operações de leitura.

**Princípio:** API routes são usadas para operações que requerem lógica de negócio, validação server-side, uso do `service_role` ou chamadas a serviços externos.

---

## Rotas Existentes

### `POST /api/orders`

Cria um novo pedido. Rota **pública** (sem autenticação).

**Request body:**
```typescript
{
  customer: {
    name: string          // min 2, max 120
    whatsapp: string      // min 8, max 30 (números ou formatado)
    address: string       // min 5, max 250 ("rua, número, bairro")
    date: string          // "YYYY-MM-DD"
    time: string          // "HH:MM"
  },
  selection: {
    guests: number        // 4–50 (clampado se fora do range)
    meatId: string        // "raiz" | "ouro" | "lenda"
    beverages: Array<{
      id: string          // id da bebida
      quantity: number    // 0–500
    }>
    services: string[]    // ids dos serviços
    accompaniments: string[] // ids dos acompanhamentos
  }
}
```

**Response 201:**
```typescript
{
  id: string           // UUID do pedido
  orderNumber: number  // número sequencial legível
}
```

**Response 400:**
```typescript
{ error: string }    // mensagem de validação
```

**Response 500:**
```typescript
{ error: string }    // mensagem genérica (nunca expor stack trace)
```

**Lógica de negócio:**
1. Validação Zod do body
2. Busca o kit de carne pelo `meatId`
3. Valida e enriquece bebidas, serviços e acompanhamentos
4. Calcula `subtotal` e `total`
5. Busca cliente por `phone` → cria ou atualiza
6. Insere o pedido com `status: "new"`
7. Retorna `{ id, orderNumber }`

---

## Rotas a Criar (Fase 2)

### `GET /api/orders/[id]` — Rastreamento público

Retorna dados públicos de um pedido (para a página de rastreamento).

```typescript
// Request: GET /api/orders/QFF-1234 (por order_number)
// Response 200:
{
  orderNumber: number
  status: OrderStatus
  statusLabel: string
  deliveryDate: string    // "2026-05-10"
  deliveryTime: string    // "18:00"
  guestsCount: number
  meatType: string
  estimatedArrival: string | null
  timeline: Array<{
    status: OrderStatus
    label: string
    happenedAt: string
  }>
}
```

**Segurança:** retornar apenas dados não sensíveis. Nunca expor endereço completo, dados do cliente ou notas internas.

---

### `PATCH /api/admin/orders/[id]/status` — Atualizar status

Rota **autenticada** (admin ou operator).

```typescript
// Request:
{
  status: OrderStatus
  notes?: string
  pickupDate?: string    // obrigatório ao mover para "scheduled_pickup"
  pickupTime?: string
  coolerId?: string      // obrigatório ao mover para "picking"
}

// Response 200:
{
  id: string
  status: OrderStatus
  updatedAt: string
}
```

---

### `POST /api/admin/orders/[id]/assign` — Atribuir motorista

```typescript
// Request:
{ driverId: string }

// Response 200:
{ id: string, assignedDriverId: string }
```

---

### `POST /api/webhooks/push-notification` — Enviar push (interno)

Chamado internamente quando o status do pedido muda. Envia push notification para o cliente.

```typescript
// Request (interno — header Authorization com secret):
{
  orderId: string
  newStatus: OrderStatus
  customerId: string
}
```

---

## Padrões de API

### Estrutura de uma rota

```typescript
// apps/web/app/api/admin/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const UpdateStatusSchema = z.object({
  status: z.enum(["new", "picking", "in_route", "delivered", "consuming", "scheduled_pickup", "collected", "completed"]),
  notes: z.string().max(500).optional(),
  coolerId: z.string().uuid().optional(),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  pickupTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Autenticação
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  // 2. Verificar role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "operator"].includes(profile.role)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 })
  }

  // 3. Validação do body
  const body = await request.json().catch(() => null)
  const parsed = UpdateStatusSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // 4. Lógica de negócio
  const { id } = await params
  const { status, notes, coolerId, pickupDate, pickupTime } = parsed.data

  const updateData: Record<string, unknown> = { status }
  if (coolerId) updateData.cooler_id = coolerId
  if (pickupDate) updateData.pickup_date = pickupDate
  if (pickupTime) updateData.pickup_time = pickupTime
  if (status === "delivered") updateData.delivered_at = new Date().toISOString()
  if (status === "collected") updateData.collected_at = new Date().toISOString()

  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", id)
    .select("id, status, updated_at")
    .single()

  if (error) {
    console.error("[PATCH /api/admin/orders/status]", error)
    return NextResponse.json({ error: "Falha ao atualizar pedido." }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

---

## Tratamento de Erros

### Erros de validação (400)
Sempre retornar `error: string` com mensagem amigável. Opcionalmente incluir `details` para debugging em development.

### Erros de autenticação (401 / 403)
- 401: sem sessão → redirecionar para login
- 403: sessão válida mas sem permissão → mostrar erro

### Erros de servidor (500)
- **Nunca expor** stack trace, query SQL ou mensagem interna do banco
- Logar no servidor (Sentry) com contexto completo
- Retornar mensagem genérica para o cliente

```typescript
// Padrão de erro 500 seguro
if (dbError) {
  // Log interno completo
  console.error("[rota]", { error: dbError, userId: user.id, params })
  // Resposta segura para o cliente
  return NextResponse.json(
    { error: "Erro interno. Tente novamente." },
    { status: 500 }
  )
}
```

---

## Rate Limiting (Fase 2)

Usando Upstash Redis + `@upstash/ratelimit`:

| Rota | Limite | Janela |
|---|---|---|
| `POST /api/orders` | 5 pedidos | 1 hora por IP |
| `GET /api/orders/[id]` | 60 requests | 1 minuto por IP |
| `POST /api/admin/*` | 100 requests | 1 minuto por usuário |

---

## Clientes Supabase — quando usar qual

| Contexto | Cliente | Quando usar |
|---|---|---|
| Server Component | `createClient()` | Fetch de dados em páginas (usa sessão do usuário via cookie) |
| API Route autenticada | `createClient()` | Operações que devem respeitar RLS |
| API Route pública | `createAdminClient()` | Apenas quando necessário criar registros sem usuário logado |
| Client Component | `createBrowserClient()` | Subscriptions Realtime, auth client-side |
| Scripts / migrations | `createAdminClient()` | Operações administrativas |

> **Atenção:** `createAdminClient()` usa `service_role_key` e **bypassa completamente o RLS**. Usar com extremo cuidado e apenas server-side.

---

## Validação Compartilhada

Os schemas Zod devem ser definidos **uma única vez** em `packages/shared/utils/validation.ts` e importados tanto no frontend quanto na API:

```typescript
// packages/shared/src/utils/validation.ts
import { z } from "zod"

export const CreateOrderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    whatsapp: z.string().trim().min(8).max(30),
    address: z.string().trim().min(5).max(250),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/),
  }),
  selection: z.object({
    guests: z.number().int().min(4).max(50),
    meatId: z.enum(["raiz", "ouro", "lenda"]),
    beverages: z.array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().min(0).max(500),
      })
    ).default([]),
    services: z.array(z.string().min(1)).default([]),
    accompaniments: z.array(z.string().min(1)).default([]),
  }),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
```

---

## Tipos de Resposta de Erro

Padronizar o formato de erro em toda a aplicação:

```typescript
// packages/shared/src/types/api.ts
export interface ApiError {
  error: string
  details?: unknown    // apenas em development
  code?: string        // código de erro interno (para i18n futuro)
}

export interface ApiSuccess<T> {
  data: T
}

// Helper no web
export function isApiError(response: unknown): response is ApiError {
  return typeof response === "object" && response !== null && "error" in response
}
```
