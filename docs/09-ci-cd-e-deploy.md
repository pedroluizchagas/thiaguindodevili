# 09 — CI/CD e Deploy

> GitHub Actions, ambientes, estratégia de branches, Vercel (web) e EAS Build (mobile).

---

## Estratégia de Branches

```
main          ← Produção. Merges apenas via PR aprovado + CI verde.
develop       ← Integração contínua. Branch base para features.
feature/*     ← Features e correções. Abrir PR para develop.
hotfix/*      ← Correções urgentes em produção. PR direto para main + develop.
```

### Regras
- Nenhum push direto em `main` — apenas via PR
- Todo PR requer: CI verde (lint + testes) + 1 aprovação
- Branch `develop` é deployada automaticamente em ambiente de **staging**
- Branch `main` é deployada automaticamente em **produção**

---

## Ambientes

| Ambiente | Branch | URL | Supabase |
|---|---|---|---|
| Development | local | localhost:3000 | Projeto local ou projeto dev |
| Staging | develop | staging.quemfezfez.com.br | Projeto Supabase staging |
| Production | main | quemfezfez.com.br | Projeto Supabase prod |

### Variáveis por ambiente (GitHub Secrets / Vercel Env Vars)

Cada ambiente tem seu próprio conjunto de segredos:

```
# Production (main)
NEXT_PUBLIC_SUPABASE_URL         → projeto prod
SUPABASE_SERVICE_ROLE_KEY        → chave prod
NEXT_PUBLIC_APP_URL              → https://quemfezfez.com.br

# Staging (develop)
NEXT_PUBLIC_SUPABASE_URL         → projeto staging
SUPABASE_SERVICE_ROLE_KEY        → chave staging
NEXT_PUBLIC_APP_URL              → https://staging.quemfezfez.com.br
```

---

## GitHub Actions — Workflows

### 1. CI — Pull Request (`ci.yml`)

Roda em todo PR aberto ou atualizado contra `develop` ou `main`.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-typecheck:
    name: Lint & TypeCheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm -r lint
      - run: pnpm -r typecheck

  test-unit:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    needs: lint-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  test-e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: lint-typecheck
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.STAGING_SERVICE_ROLE_KEY }}
      NEXT_PUBLIC_APP_URL: http://localhost:3000
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @qff/web exec playwright install --with-deps chromium
      - run: pnpm --filter @qff/web test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: apps/web/playwright-report/

  security-audit:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit --audit-level moderate
```

---

### 2. Deploy Staging (`deploy-staging.yml`)

Roda em push para `develop`.

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    name: Deploy to Vercel Staging
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: apps/web
          alias-domains: staging.quemfezfez.com.br
```

---

### 3. Deploy Produção (`deploy-production.yml`)

Roda em push para `main` (após PR aprovado e mergeado).

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy to Vercel Production
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
          working-directory: apps/web
```

---

### 4. Build Mobile (`mobile-build.yml`)

Roda manualmente ou em tag `v*.*.*`.

```yaml
# .github/workflows/mobile-build.yml
name: Mobile Build (EAS)

on:
  workflow_dispatch:
    inputs:
      profile:
        description: "Build profile"
        required: true
        default: "preview"
        type: choice
        options: [development, preview, production]
  push:
    tags: ["v*.*.*"]

jobs:
  build:
    name: EAS Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - name: Build
        working-directory: apps/mobile
        run: eas build --platform all --profile ${{ github.event.inputs.profile || 'production' }} --non-interactive
```

---

## Deploy Web (Vercel)

### Configuração do projeto Vercel

1. Importar repositório no Vercel
2. Configurar **Root Directory**: `apps/web`
3. Configurar **Build Command**: `pnpm build` (ou `cd ../.. && pnpm --filter @qff/web build`)
4. Configurar **Output Directory**: `.next`
5. Adicionar todas as **Environment Variables** por ambiente (ver [04-autenticacao-e-seguranca.md](./04-autenticacao-e-seguranca.md))

### `vercel.json` (na raiz de `apps/web`)

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## Deploy Mobile (EAS Build)

### Setup inicial

```bash
npm install -g eas-cli
eas login
eas build:configure   # cria eas.json e configura o projeto
```

### Fluxo de publicação

```
Development Build → Preview Build → Production Build → Submit to Stores
    (dev client)     (APK/IPA)        (store build)
```

### Comandos principais

```bash
# Build de preview (APK para Android, IPA ad-hoc para iOS)
eas build --platform all --profile preview

# Build de produção
eas build --platform all --profile production

# Submeter para as lojas
eas submit --platform ios
eas submit --platform android

# OTA Update (sem novo build — apenas JS)
eas update --branch production --message "Fix: correção de cálculo de preço"
```

### Over-the-Air (OTA) Updates
Com Expo Updates, atualizações de JavaScript podem ser publicadas sem novo build nas lojas, reduzindo o ciclo de release para correções urgentes.

---

## Secrets necessários no GitHub

```
# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# Supabase — Staging
STAGING_SUPABASE_URL
STAGING_SUPABASE_ANON_KEY
STAGING_SERVICE_ROLE_KEY

# Supabase — Production (usados no Vercel, não no CI diretamente)
PROD_SUPABASE_URL
PROD_SUPABASE_ANON_KEY
PROD_SERVICE_ROLE_KEY

# Expo / EAS
EXPO_TOKEN

# Sentry
SENTRY_AUTH_TOKEN
```

---

## Checklist de Deploy Manual (primeira vez em produção)

- [ ] Aplicar todos os migrations no Supabase prod (`scripts/001` a `scripts/004`)
- [ ] Verificar RLS policies no painel Supabase
- [ ] Configurar domínio customizado no Vercel
- [ ] Configurar SSL (automático no Vercel)
- [ ] Testar `POST /api/orders` em produção
- [ ] Criar primeiro usuário admin no Supabase Auth
- [ ] Verificar Vercel Analytics no painel
- [ ] Configurar Sentry project e testar primeiro erro
- [ ] Verificar Core Web Vitals no Vercel Speed Insights
