# 04 — Autenticação e Segurança

> Auth flow, roles, variáveis de ambiente, proteção de rotas e práticas OWASP.

---

## Autenticação

### Provedor
**Supabase Auth** — gerencia sessões, JWT, refresh tokens e provedores OAuth.

### Método atual
- Email + senha (para operadores internos)
- **Sem auto-cadastro público** — usuários do admin são criados manualmente pelo administrador no painel Supabase

### Fluxo de autenticação (web admin)

```
1. Operador acessa /admin/login
2. Preenche email + senha → chama supabase.auth.signInWithPassword()
3. Supabase retorna JWT + refresh token → armazenados em cookies httpOnly via @supabase/ssr
4. Middleware (middleware.ts) verifica sessão em todas as rotas /admin/*
5. Se sessão expirada → supabase.auth.refreshSession() automático
6. Se sem sessão → redirect para /admin/login
7. Logout → supabase.auth.signOut() + limpeza de cookies
```

### Middleware de proteção (`middleware.ts`)

O middleware deve proteger todas as rotas `/admin/*` e `/api/*` (exceto `/api/orders` que é pública):

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(...)

  // Refresh session
  const { data: { session } } = await supabase.auth.getSession()

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")
  const isLoginPage = request.nextUrl.pathname === "/admin/login"
  const isPublicApi = request.nextUrl.pathname === "/api/orders"

  if (isAdminRoute && !isLoginPage && !session) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
}
```

---

## Roles e Permissões

### Roles definidas

| Role | Descrição | Permissões |
|---|---|---|
| `admin` | Dono/gerente | Acesso total — pode criar/excluir usuários, alterar catálogo, ver relatórios |
| `operator` | Operador de base | Ver/editar pedidos, clientes, coolers. Não pode excluir nem alterar config |
| `driver` | Motorista | Ver apenas pedidos atribuídos a ele, atualizar status de entrega |

### Como o role é determinado
O role fica em `public.profiles.role`. O trigger `on_auth_user_created` cria o perfil com o role definido em `raw_user_meta_data.role` no momento do cadastro.

Para criar um novo operador:
1. Admin cria usuário no painel Supabase → `Authentication > Users > Invite user`
2. Define `role` no metadata ao criar: `{ "full_name": "Nome", "role": "operator" }`

### Verificação de role em Server Components

```typescript
// Em um Server Component que requer role admin
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") redirect("/admin")

  // ... renderiza a página
}
```

---

## Variáveis de Ambiente

### Todas as variáveis necessárias

```bash
# ─── Supabase ─────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# Chave pública (anon) — pode ser exposta no cliente. RLS protege os dados.
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...

# Chave de service role — NUNCA expor no cliente. Bypassa RLS completamente.
# Usada apenas em API routes server-side e scripts administrativos.
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# ─── App ──────────────────────────────────────────────────────────
# URL base da aplicação (sem trailing slash)
NEXT_PUBLIC_APP_URL=https://quemfezfez.com.br

# ─── Sentry ───────────────────────────────────────────────────────
# DSN público (usado no cliente para reportar erros)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
# DSN privado (server-side, inclui tokens de autenticação)
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=quem-fez-fez
SENTRY_PROJECT=web
SENTRY_AUTH_TOKEN=sntrys_...  # para upload de source maps no CI

# ─── Rate Limiting (Upstash Redis — Fase 2) ───────────────────────
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Arquivo `.env.example`
Deve existir na raiz do projeto (e em `apps/web/`) com todas as variáveis e valores de exemplo — nunca com valores reais:

```bash
# apps/web/.env.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

### Regras de segurança
- Variáveis com prefixo `NEXT_PUBLIC_` são **expostas no bundle do cliente** — nunca colocar segredos nelas
- `SUPABASE_SERVICE_ROLE_KEY` deve existir **apenas** no servidor e no CI/CD secrets — nunca no `.env.local` de dev (prefira `.env.local` que está no `.gitignore`)
- **Nunca commitar** arquivos `.env`, `.env.local`, `.env.production`
- O `.gitignore` deve incluir: `.env`, `.env.local`, `.env.*.local`

---

## Segurança da API

### Rota pública `POST /api/orders`

Esta é a única rota pública do sistema. Riscos:
- **Spam / flood** — um bot pode criar centenas de pedidos falsos
- **Dados inválidos** — atualmente validados pelo Zod, mas sem rate limit

**Proteções a implementar (Fase 2):**

```typescript
// 1. Rate limiting por IP (usando Upstash Redis)
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 pedidos por hora por IP
})

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown"
  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em 1 hora." },
      { status: 429 }
    )
  }
  // ... lógica do pedido
}
```

```typescript
// 2. Validação de tamanho máximo do body
const MAX_BODY_SIZE = 10_000 // 10KB

export async function POST(request: Request) {
  const contentLength = request.headers.get("content-length")
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "Payload muito grande." }, { status: 413 })
  }
  // ...
}
```

### Rotas autenticadas do admin

Toda rota da área `/admin` deve:
1. Verificar sessão válida via Supabase Auth
2. Verificar role adequado via `profiles` table
3. Usar `createClient()` (server client com cookie) — nunca `createAdminClient()` em componentes

---

## OWASP Top 10 — Checklist

| # | Vulnerabilidade | Status | Mitigação |
|---|---|---|---|
| A01 | Broken Access Control | Parcial | RLS habilitado; middleware de auth; **falta granularidade por role** |
| A02 | Cryptographic Failures | OK | HTTPS enforced pelo Supabase/Vercel; senhas gerenciadas pelo Supabase Auth |
| A03 | Injection | OK | Supabase JS client usa queries parametrizadas; Zod valida inputs |
| A04 | Insecure Design | Parcial | **Falta rate limiting** na API pública; **falta proteção CSRF** |
| A05 | Security Misconfiguration | Parcial | **`ignoreBuildErrors: true` a remover**; imagens `unoptimized` a remover |
| A06 | Vulnerable Components | Verificar | Rodar `pnpm audit` regularmente; Dependabot no CI |
| A07 | Auth Failures | OK | Supabase Auth com JWT; refresh automático; sem auto-cadastro |
| A08 | Software Integrity | Pendente | **Adicionar Subresource Integrity (SRI)** para assets externos; validar no CI |
| A09 | Logging Failures | Pendente | **Falta logging estruturado** de erros; **Sentry a configurar** |
| A10 | Server-Side Request Forgery | N/A | Sem chamadas a URLs externas fornecidas pelo usuário |

---

## Content Security Policy (CSP)

Adicionar headers de segurança no `next.config.mjs`:

```javascript
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://sentry.io",
    ].join("; "),
  },
]

const nextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }]
  },
}
```

---

## Segurança no Mobile

- **Tokens Supabase:** armazenados via `expo-secure-store` (keychain/keystore nativo) — nunca em `AsyncStorage` puro
- **API keys:** nunca hardcodadas no código — usar `expo-constants` com `app.config.js`
- **Deep links:** validar sempre o scheme e o host antes de processar
- **QR code scanner:** validar o conteúdo do QR antes de qualquer ação — deve corresponder ao padrão `QFF-\d{3}`

---

## Auditoria e Logs de Segurança

- Toda mudança de status de pedido é registrada em `order_timeline` com `created_by`
- Eventos de auth (login, logout, falha) são logados automaticamente pelo Supabase
- **A implementar:** log de erros 5xx no Sentry com contexto do usuário (sem dados sensíveis)
- **A implementar:** alerta de múltiplas falhas de login (brute force detection) via Supabase Auth settings
