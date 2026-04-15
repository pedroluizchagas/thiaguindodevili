# 02 — Arquitetura Geral

> Decisões de estrutura, padrões de código, organização do monorepo e convenções.

---

## Visão Macro

O projeto é uma plataforma multi-canal. A arquitetura adotada é um **monorepo pnpm workspaces** com pacotes compartilhados entre web e mobile, evitando duplicação de tipos, constantes e lógica de negócio.

```
thiaguindodevili/             ← raiz do monorepo
├── apps/
│   ├── web/                  ← Next.js (site + admin)
│   └── mobile/               ← Expo (React Native)
├── packages/
│   ├── shared/               ← tipos, constantes, utils (puro TS, sem dependências de UI)
│   ├── supabase/             ← cliente Supabase + tipos gerados
│   └── ui-mobile/            ← componentes NativeWind reutilizáveis
├── docs/                     ← esta documentação
├── scripts/                  ← SQL migrations
├── pnpm-workspace.yaml
└── package.json              ← workspace root
```

> **Estado atual:** o projeto ainda é um monólito web (`apps/web`). A migração para monorepo é a Fase 1 do roadmap.

---

## Estrutura do App Web (`apps/web`)

```
apps/web/
├── app/                          ← Next.js App Router
│   ├── layout.tsx                ← Root layout (providers, fonts, analytics)
│   ├── page.tsx                  ← Homepage pública
│   ├── globals.css
│   ├── admin/                    ← Área protegida
│   │   ├── layout.tsx            ← Layout com sidebar (requer auth)
│   │   ├── page.tsx              ← Dashboard
│   │   ├── orders/
│   │   │   └── page.tsx          ← Kanban de pedidos
│   │   ├── coolers/
│   │   │   └── page.tsx          ← Gestão de coolers
│   │   ├── customers/
│   │   │   └── page.tsx          ← Lista de clientes
│   │   └── login/
│   │       └── page.tsx          ← Login
│   └── api/
│       └── orders/
│           └── route.ts          ← POST /api/orders
├── components/
│   ├── ui/                       ← Shadcn/UI (gerados, não editar diretamente)
│   ├── layout/                   ← Header, Footer
│   ├── sections/                 ← Seções da homepage
│   ├── builder/                  ← Builder de pedido (steps + context + progress)
│   └── admin/                    ← Componentes do painel admin
├── hooks/                        ← Custom hooks
├── lib/
│   ├── constants/                ← Constantes do domínio (catálogo, status)
│   ├── types/                    ← Interfaces TypeScript
│   ├── supabase/                 ← Clientes Supabase (browser, server, middleware)
│   └── utils.ts                  ← Funções utilitárias gerais
├── public/                       ← Imagens e assets estáticos
├── middleware.ts                 ← Proteção de rotas + refresh de sessão
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## Estrutura do App Mobile (`apps/mobile`)

```
apps/mobile/
├── app/                          ← Expo Router (file-based routing)
│   ├── _layout.tsx               ← Root layout (providers, splash)
│   ├── index.tsx                 ← Tela inicial / redirect
│   ├── (public)/                 ← Rotas públicas
│   │   ├── _layout.tsx
│   │   ├── explore.tsx           ← Explorar kits
│   │   └── builder/
│   │       ├── _layout.tsx
│   │       ├── step-guests.tsx
│   │       ├── step-meat.tsx
│   │       ├── step-beverages.tsx
│   │       ├── step-services.tsx
│   │       └── step-checkout.tsx
│   ├── (auth)/                   ← Requer autenticação (cliente logado)
│   │   ├── _layout.tsx
│   │   ├── orders.tsx            ← Histórico de pedidos
│   │   ├── order/[id].tsx        ← Detalhe + rastreamento
│   │   └── profile.tsx
│   └── (operator)/               ← App operador (role: operator/driver)
│       ├── _layout.tsx
│       ├── daily.tsx             ← Pedidos do dia
│       ├── order/[id].tsx        ← Detalhe + atualizar status
│       └── scan.tsx              ← Scanner QR code do cooler
├── components/                   ← Componentes NativeWind
├── hooks/                        ← Hooks específicos do mobile
├── lib/                          ← Utils mobile
├── assets/                       ← Imagens, ícones, splash
├── app.json                      ← Configuração Expo
├── eas.json                      ← Configuração EAS Build
└── package.json
```

---

## Pacote Compartilhado (`packages/shared`)

Contém código **sem dependências de UI** — utilizável tanto no Next.js quanto no Expo:

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── order.ts              ← Order, OrderStatus, BeverageItem, etc.
│   │   ├── customer.ts           ← Customer
│   │   ├── cooler.ts             ← Cooler, CoolerStatus
│   │   ├── profile.ts            ← Profile, UserRole
│   │   └── index.ts              ← Re-exports
│   ├── constants/
│   │   ├── builder.ts            ← MEAT_OPTIONS, BEVERAGE_OPTIONS, etc.
│   │   ├── order-status.ts       ← ORDER_STATUS_CONFIG, KANBAN_COLUMNS
│   │   └── index.ts
│   └── utils/
│       ├── pricing.ts            ← calculateOrderTotal()
│       ├── format.ts             ← formatCurrency(), formatDate()
│       └── validation.ts        ← schemas Zod compartilhados
├── package.json
└── tsconfig.json
```

**Importação nos apps:**
```typescript
import { Order, OrderStatus } from "@qff/shared/types"
import { MEAT_OPTIONS } from "@qff/shared/constants"
import { calculateOrderTotal } from "@qff/shared/utils"
```

---

## Padrões de Arquitetura

### Separação de responsabilidades (SRP)
- Componentes React: apenas renderização e UX local
- Hooks: lógica de estado e side effects
- `lib/utils/`: funções puras sem estado
- `lib/constants/`: dados imutáveis do domínio
- API routes: validação → lógica → persistência

### Componentes
- **Server Components** por padrão no Next.js App Router
- Adicionar `"use client"` apenas quando necessário (interatividade, hooks, browser APIs)
- Props tipadas com interface explícita — nunca `any`
- Componentes de UI (Shadcn) em `components/ui/` — não editar diretamente
- Componentes de domínio em subpastas temáticas (`admin/`, `builder/`, `sections/`)

### Estado global
- **Builder:** Context API (`BuilderContext`) — correto para fluxo de formulário multi-step
- **Admin:** Server-side data fetching (Supabase direto no Server Component)
- **Mobile:** Zustand (a adicionar) para estado do usuário logado e carrinho

### Formulários
- React Hook Form + Zod resolver para todos os formulários
- Schema de validação definido em `packages/shared/utils/validation.ts`
- O mesmo schema é usado no frontend e na API route (single source of truth)

### Tratamento de erros
- API routes: `try/catch` + retorno de `NextResponse.json({ error: string }, { status: number })`
- Componentes: Error Boundaries para seções críticas
- Mobile: error states explícitos em cada tela

---

## Convenções TypeScript

```typescript
// BOM — interface explícita
interface OrderCardProps {
  order: Order
  onStatusChange: (status: OrderStatus) => void
}

// RUIM — any
function process(data: any) { ... }

// BOM — unknown + type guard
function process(data: unknown) {
  if (!isOrder(data)) throw new Error("Invalid order")
  ...
}

// BOM — const assertion para objetos de configuração
const STATUS_LABELS = {
  new: "Novo",
  completed: "Finalizado",
} as const

// BOM — satisfies para validar objetos contra tipo sem widening
const config = {
  minGuests: 4,
  maxGuests: 50,
} satisfies BuilderConfig
```

### Regras obrigatórias
- `strict: true` no tsconfig — sem exceções
- Sem `ignoreBuildErrors` — todos os erros TS devem ser corrigidos
- Sem `@ts-ignore` — use `@ts-expect-error` com comentário explicativo se absolutamente necessário
- Tipos gerados pelo Supabase (`supabase gen types`) em `packages/supabase/database.types.ts`

---

## Fluxo de Dados (web)

```
Browser Request
     ↓
Next.js Middleware (auth check, session refresh)
     ↓
Server Component (fetch dados via Supabase server client)
     ↓
Client Component (interatividade, formulários)
     ↓
API Route (POST/PUT/DELETE — validação Zod → Supabase)
     ↓
Supabase (PostgreSQL + RLS)
```

---

## Configuração do Monorepo (pnpm workspaces)

### `pnpm-workspace.yaml`
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### `package.json` (raiz)
```json
{
  "name": "quem-fez-fez",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter @qff/web dev",
    "dev:mobile": "pnpm --filter @qff/mobile start",
    "build": "pnpm --filter @qff/web build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck"
  }
}
```

### Nomes dos pacotes
| Pasta | Nome do pacote |
|---|---|
| `apps/web` | `@qff/web` |
| `apps/mobile` | `@qff/mobile` |
| `packages/shared` | `@qff/shared` |
| `packages/supabase` | `@qff/supabase` |
| `packages/ui-mobile` | `@qff/ui-mobile` |

---

## Decisões Arquiteturais Registradas

| # | Decisão | Justificativa |
|---|---|---|
| 1 | Monorepo pnpm workspaces | Compartilhar tipos e lógica sem duplicação; deploys independentes |
| 2 | Next.js App Router (não Pages) | Server Components, layouts aninhados, melhor DX |
| 3 | Supabase como BaaS | Reduz infraestrutura; PostgreSQL completo; RLS; Auth; Realtime |
| 4 | Expo Router (file-based) | Consistência com o modelo mental do Next.js; deep linking nativo |
| 5 | Zod como schema único | Validação compartilhada entre frontend, mobile e API |
| 6 | Tailwind + NativeWind | Mesma mental model de classes utilitárias em web e mobile |
| 7 | Context API para builder | Escopo isolado; sem overhead de lib global para fluxo de formulário |
| 8 | Zustand para mobile | Leve, sem boilerplate, fácil de persistir com AsyncStorage |
