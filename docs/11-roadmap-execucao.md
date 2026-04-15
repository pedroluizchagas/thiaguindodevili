# 11 — Roadmap de Execução

> Fases, tarefas priorizadas, critérios de aceite e sequência de implementação.

---

## Visão das Fases

```
FASE 1           FASE 2           FASE 3           FASE 4
Fundação    →    Web Completo →   Mobile App   →   Produção
(2–3 sem)        (3–4 sem)        (5–7 sem)         (2 sem)
```

---

## FASE 1 — Fundação e Profissionalização

**Objetivo:** transformar o protótipo em uma base técnica sólida, segura e pronta para crescer.

---

### 1.1 — Limpeza e correções obrigatórias

**Arquivo:** `apps/web/next.config.mjs`

- [ ] Remover `typescript.ignoreBuildErrors: true`
- [ ] Remover `images.unoptimized: true`
- [ ] Corrigir todos os erros TypeScript que eram silenciados
- [ ] Adicionar headers de segurança (CSP, HSTS, X-Frame-Options)

**Critério de aceite:** `pnpm build` completa sem erros TS; `pnpm lint` sem warnings críticos.

---

### 1.2 — Organização do monorepo

- [ ] Criar estrutura `apps/web/`, `apps/mobile/`, `packages/shared/`
- [ ] Mover código atual para `apps/web/`
- [ ] Criar `pnpm-workspace.yaml`
- [ ] Criar `packages/shared/` com tipos e constantes extraídos de `lib/`
- [ ] Atualizar importações para usar `@qff/shared`
- [ ] Renomear `package.json` de `my-v0-project` para `@qff/web`

**Critério de aceite:** `pnpm dev` roda em `apps/web`; imports de `@qff/shared` funcionam.

---

### 1.3 — Documentação base

- [ ] Criar `README.md` na raiz com: visão geral, setup local, variáveis de ambiente, como rodar
- [ ] Criar `apps/web/.env.example` com todas as variáveis documentadas
- [ ] Criar `apps/mobile/.env.example`

**Critério de aceite:** um dev novo consegue rodar o projeto localmente seguindo apenas o README.

---

### 1.4 — CI/CD básico

- [ ] Criar `.github/workflows/ci.yml` (lint + typecheck + testes)
- [ ] Criar `.github/workflows/deploy-staging.yml`
- [ ] Criar `.github/workflows/deploy-production.yml`
- [ ] Configurar GitHub Environments (staging, production) com secrets
- [ ] Conectar repositório ao Vercel e configurar projeto
- [ ] Configurar branch protection no GitHub (`main`: requer CI verde + 1 aprovação)

**Critério de aceite:** PR para `develop` dispara CI; merge em `develop` faz deploy no staging.

---

### 1.5 — Segurança básica

- [ ] Revisar `POST /api/orders`: confirmar que `createAdminClient()` é adequado (vs RLS)
- [ ] Adicionar `.env` e `.env.local` ao `.gitignore` (verificar se já está)
- [ ] Verificar que `SUPABASE_SERVICE_ROLE_KEY` não está exposto client-side
- [ ] Criar migration `007_rls_granular_by_role.sql` com políticas por role

**Critério de aceite:** `pnpm audit` sem vulnerabilidades críticas; role-based RLS funcionando no Supabase.

---

### 1.6 — Testes unitários iniciais

- [ ] Instalar e configurar Vitest + Testing Library
- [ ] Escrever testes para `lib/constants/builder.ts` (validar estrutura dos dados)
- [ ] Escrever testes para a lógica de cálculo de preço (extraída para `packages/shared`)
- [ ] Escrever testes para os schemas Zod de `CreateOrderSchema`
- [ ] Configurar coverage report

**Critério de aceite:** `pnpm test` roda; cobertura ≥ 70% em `packages/shared/utils/`.

---

## FASE 2 — Web Completo

**Objetivo:** completar o painel admin, melhorar performance/SEO e garantir qualidade com testes.

---

### 2.1 — Funcionalidades admin faltantes

- [ ] Página de detalhe do pedido (`/admin/orders/[id]`)
  - Timeline de status
  - Edição de notas internas
  - Atribuição de motorista
  - Aplicar desconto
- [ ] Ação de mudança de status com formulário (modal com validação)
- [ ] Relatório de receita por período (gráfico de linha com Recharts)
- [ ] Gestão de usuários/operadores (apenas role `admin`)
- [ ] Configuração de catálogo editável (migration `008_product_catalog.sql`)

**Critério de aceite:** fluxo completo do pedido gerenciável pelo admin sem sair do painel.

---

### 2.2 — Página de rastreamento pública

- [ ] Criar `app/pedido/[orderNumber]/page.tsx`
- [ ] Criar `GET /api/orders/[orderNumber]` (dados públicos apenas)
- [ ] UI: timeline de status + informações do pedido (sem dados sensíveis)
- [ ] Link de rastreamento enviado ao cliente após criação do pedido

**Critério de aceite:** cliente consegue acessar `/pedido/42` e ver o status atual.

---

### 2.3 — SEO e performance

- [ ] Configurar metadata completa (`title`, `description`, OpenGraph)
- [ ] Criar `app/sitemap.ts` e `app/robots.ts`
- [ ] Criar imagem Open Graph `public/og-image.jpg`
- [ ] Verificar `next/image` em todas as imagens (substituir `<img>` se houver)
- [ ] Implementar `dynamic()` para componentes pesados do admin
- [ ] Medir e atingir Core Web Vitals: LCP < 2.5s, CLS < 0.1

---

### 2.4 — Rate limiting e segurança adicional

- [ ] Integrar Upstash Redis: 5 pedidos/hora por IP em `POST /api/orders`
- [ ] Implementar validação de tamanho máximo do body
- [ ] Adicionar headers CSP completo ao `next.config.mjs`

---

### 2.5 — Testes da web

- [ ] Testes do builder (steps 1–5, fluxo completo)
- [ ] Testes da API `POST /api/orders` (happy path + erros)
- [ ] Testes E2E com Playwright (fluxo de criação de pedido)
- [ ] Testes das novas rotas admin

---

### 2.6 — Monitoramento web

- [ ] Configurar Sentry para web (client + server)
- [ ] Adicionar Error Boundary global
- [ ] Configurar alertas no Sentry (spike de erros, erros críticos)
- [ ] Verificar Vercel Speed Insights funcionando
- [ ] Implementar eventos de analytics no builder (`track()`)

---

## FASE 3 — App Mobile

**Objetivo:** criar os dois apps mobile (cliente e operador) e publicar nas lojas.

---

### 3.1 — Setup do projeto mobile

- [ ] Criar `apps/mobile/` com Expo SDK 52
- [ ] Configurar Expo Router (file-based navigation)
- [ ] Configurar NativeWind 4
- [ ] Configurar cliente Supabase com `expo-secure-store`
- [ ] Configurar EAS Build (`eas.json`)
- [ ] Criar `eas build --profile development` funcionando no emulador
- [ ] Configurar Sentry para mobile

---

### 3.2 — App do cliente (Builder + Pedidos)

- [ ] Tela `explore.tsx` — landing dos kits
- [ ] Builder de pedido (5 steps — replicar lógica do web usando `@qff/shared`)
- [ ] Tela de confirmação do pedido
- [ ] Tela de histórico de pedidos (`/customer/orders`)
- [ ] Tela de rastreamento em tempo real (`/customer/order/[id]`) com Supabase Realtime
- [ ] Tela de perfil do cliente
- [ ] Push notifications para mudanças de status

---

### 3.3 — App do operador (Admin mobile)

- [ ] Tela de pedidos do dia (`/operator/daily`)
- [ ] Detalhe do pedido com ação de mudança de status
- [ ] Scanner de QR code do cooler (`/operator/scan`)
- [ ] Confirmação de entrega
- [ ] Tela de perfil do operador / logout

---

### 3.4 — Push notifications

- [ ] Criar migration `009_push_tokens.sql`
- [ ] Implementar `registerForPushNotifications()` no app
- [ ] Criar webhook/trigger no Supabase para disparar push ao mudar status
- [ ] Ou: endpoint interno `POST /api/webhooks/push-notification`
- [ ] Testar push em iOS e Android

---

### 3.5 — Build e submissão às lojas

- [ ] Configurar perfis EAS (development, preview, production)
- [ ] Gerar builds de preview e testar internamente
- [ ] Configurar GitHub Actions para build mobile (`mobile-build.yml`)
- [ ] Submeter para App Store Connect (iOS)
- [ ] Submeter para Google Play Console (Android)
- [ ] Passar pela revisão das lojas

---

## FASE 4 — Hardening de Produção

**Objetivo:** garantir que o sistema aguenta produção real com monitoramento e qualidade.

---

### 4.1 — Testes de carga

- [ ] Simular 50 pedidos simultâneos via `POST /api/orders`
- [ ] Verificar limites de conexão do Supabase
- [ ] Verificar limites do Vercel Functions (timeout, memória)
- [ ] Ajustar índices do banco se necessário

---

### 4.2 — Auditoria de segurança

- [ ] Executar `pnpm audit` e corrigir vulnerabilidades
- [ ] Revisar todas as políticas RLS com usuário de cada role
- [ ] Verificar que nenhuma variável sensível está exposta no bundle client
- [ ] Testar rate limiting da API pública
- [ ] Revisar CSP e testar no navegador

---

### 4.3 — Documentação final

- [ ] Atualizar `README.md` com fluxo de deploy completo
- [ ] Documentar processo de criar novos operadores no Supabase
- [ ] Documentar processo de backup e restauração do banco
- [ ] Criar guia de onboarding para novos devs

---

### 4.4 — Monitoramento avançado

- [ ] Configurar dashboards de KPI no Supabase
- [ ] Configurar relatórios semanais automáticos de métricas de negócio
- [ ] Testar runbooks de incidente (simular falha do banco, rollback de deploy)
- [ ] Configurar uptime monitoring (ex: Vercel, Better Uptime)

---

## Resumo de Dependências entre Tarefas

```
1.1 (fix TS/build) → pode começar imediatamente
1.2 (monorepo)     → depende de 1.1 estar concluído
1.3 (docs/README)  → independente, pode rodar em paralelo
1.4 (CI/CD)        → depende de 1.2 (monorepo definido)
1.5 (segurança)    → depende de 1.1
1.6 (testes)       → depende de 1.2 (packages/shared)

2.x (features web) → depende de FASE 1 completa
3.x (mobile)       → depende de 1.2 (packages/shared disponível)
4.x (hardening)    → depende de 2.x e 3.x
```

---

## Sequência Recomendada para o Claude Code

Ao iniciar uma sessão de trabalho, seguir esta ordem:

1. Ler `docs/00-mestre.md` para contexto geral
2. Identificar qual fase/tarefa está em andamento
3. Ler o documento específico da área (ex: `05-frontend-web.md` para mudanças no web)
4. Implementar a mudança seguindo os padrões documentados
5. Escrever/atualizar testes relevantes
6. Commitar com mensagem descritiva seguindo a convenção
7. Marcar a tarefa como concluída neste documento

**Mensagens de commit recomendadas:**
```
feat(web): add order detail page for admin
fix(api): handle missing customer phone gracefully
chore(monorepo): migrate to pnpm workspaces
test(shared): add pricing calculation unit tests
docs: update environment variables documentation
refactor(builder): extract price calculation to shared package
```
