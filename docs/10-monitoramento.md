# 10 — Monitoramento e Observabilidade

> Sentry, analytics, logging, alertas e métricas de performance.

---

## Visão Geral

| Ferramenta | Propósito |
|---|---|
| **Sentry** | Rastreamento de erros (web + mobile) |
| **Vercel Analytics** | Tráfego, page views (já integrado) |
| **Vercel Speed Insights** | Core Web Vitals em produção |
| **Supabase Dashboard** | Métricas do banco (queries, conexões, storage) |
| **EAS Insights** | Crash reports do app mobile |

---

## Sentry — Web

### Instalação

```bash
pnpm --filter @qff/web add @sentry/nextjs
pnpm --filter @qff/web exec sentry-wizard -i nextjs
```

O wizard cria automaticamente:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- Instrumentação no `next.config.mjs`

### Configuração básica

```typescript
// apps/web/sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,        // privacidade: ocultar textos do usuário
      blockAllMedia: false,
    }),
  ],
  // Não enviar dados em desenvolvimento local
  enabled: process.env.NODE_ENV === "production",
  // Filtrar erros esperados
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection",
  ],
  beforeSend(event) {
    // Remover dados sensíveis antes de enviar
    if (event.request?.cookies) delete event.request.cookies
    return event
  },
})
```

```typescript
// apps/web/sentry.server.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,
  enabled: process.env.NODE_ENV === "production",
})
```

### Captura manual de erros em API routes

```typescript
// Em API routes, adicionar contexto ao capturar erros
import * as Sentry from "@sentry/nextjs"

export async function POST(request: Request) {
  try {
    // ... lógica
  } catch (err) {
    Sentry.captureException(err, {
      tags: { route: "POST /api/orders" },
      extra: { userId: "anonymous" },
    })
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
```

### Error Boundary com Sentry

```typescript
// components/error-boundary.tsx
"use client"
import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-semibold">Algo deu errado</h2>
      <button onClick={reset} className="btn-primary">Tentar novamente</button>
    </div>
  )
}
```

---

## Sentry — Mobile

```bash
pnpm --filter @qff/mobile add @sentry/react-native
```

```typescript
// apps/mobile/app/_layout.tsx
import * as Sentry from "@sentry/react-native"

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: __DEV__ ? "development" : "production",
  enabled: !__DEV__,
})

export default Sentry.wrap(RootLayout)
```

---

## Logging Estruturado

### Padrão de log

```typescript
// packages/shared/src/utils/logger.ts
type LogLevel = "info" | "warn" | "error"

interface LogContext {
  module: string
  userId?: string
  orderId?: string
  [key: string]: unknown
}

export function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  }

  if (process.env.NODE_ENV === "production") {
    // Em produção: JSON estruturado (Vercel captura automaticamente)
    console[level](JSON.stringify(entry))
  } else {
    // Em desenvolvimento: formato legível
    console[level](`[${entry.module}] ${message}`, context ?? "")
  }
}
```

### Uso nas API routes

```typescript
log("info", "Order created", { module: "api/orders", orderId: result.id })
log("error", "Failed to insert order", { module: "api/orders", error: dbError.message })
```

---

## Vercel Analytics e Speed Insights

Já configurado em `app/layout.tsx` — verificar que está presente:

```typescript
// apps/web/app/layout.tsx
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

---

## Alertas e Notificações

### Sentry Alerts (configurar no painel)

| Alerta | Condição | Canal |
|---|---|---|
| Spike de erros | > 10 erros novos em 5 min | Email + Slack |
| Erro crítico na API orders | Qualquer erro em `POST /api/orders` | Email |
| Performance degradada | P95 > 3s | Email |
| Taxa de erro > 1% | Por hora | Slack |

### Supabase Alerts (painel Supabase)

- Configurar alerta de uso de banco > 80%
- Configurar alerta de conexões ativas > 80% do limite do plano

---

## Métricas de Negócio a Acompanhar

Implementar eventos personalizados no Vercel Analytics:

```typescript
// Rastrear início do builder
import { track } from "@vercel/analytics"

// No builder context, ao avançar steps
track("builder_step_completed", { step: currentStep, meatId: selectedMeat?.id })

// Ao confirmar pedido
track("order_created", { guests: guestsCount, meatTier: selectedMeat?.tier, total })

// Ao abandonar o builder
track("builder_abandoned", { lastStep: currentStep })
```

### KPIs a monitorar

| Métrica | Fonte | Periodicidade |
|---|---|---|
| Pedidos criados | Supabase | Diária |
| Taxa de conversão do builder | Vercel Analytics | Semanal |
| Step com mais abandonos | Vercel Analytics | Semanal |
| Receita total | Supabase | Diária |
| Ticket médio | Supabase | Semanal |
| Erros 5xx | Sentry | Tempo real |
| Core Web Vitals | Vercel Speed Insights | Semanal |

---

## Dashboard de Saúde do Sistema

Criar uma página `/admin/health` (apenas para `admin`) que exibe:

- Último pedido criado (timestamp)
- Total de pedidos hoje
- Total de erros Sentry nas últimas 24h (via Sentry API)
- Status do Supabase (via health check endpoint)
- Versão do app deployada

---

## Runbook — Incidentes Comuns

### API `/api/orders` retornando 500

1. Verificar Sentry para detalhes do erro
2. Verificar logs no Vercel Functions
3. Verificar status do Supabase (status.supabase.com)
4. Se banco indisponível: ativar página de manutenção temporária
5. Rollback via Vercel se o deploy recente causou o problema

### Taxa de erro > 5% em 15 min

1. Verificar se houve deploy recente
2. Se sim: rollback imediato no Vercel (`Deployments > Promote to Production`)
3. Abrir issue no repositório com detalhes
4. Investigar root cause antes de tentar novo deploy

### Cooler "perdido" no sistema

1. Verificar `order_timeline` do pedido associado
2. Verificar `coolers.status` pelo QR code
3. Se necessário, atualizar status manualmente via painel admin
