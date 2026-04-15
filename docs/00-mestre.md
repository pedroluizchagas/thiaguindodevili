# Quem Fez, Fez! — Documentação Mestre

> Delivery de Churrasco Premium | Plataforma Web + Mobile

---

## O que é este documento

Este arquivo é o **ponto de entrada único** para toda a documentação técnica do projeto. Ele define o contexto geral, orienta o leitor e serve de mapa para os demais documentos. Claude Code deve sempre ler este arquivo antes de qualquer tarefa para entender o escopo e o estado atual.

---

## Contexto do Projeto

**Quem Fez, Fez!** é um serviço de delivery de churrasco premium que entrega kits completos (carne, cooler com bebidas, acessórios) diretamente na casa do cliente. O produto inclui opções de serviços adicionais como acendimento profissional e limpeza pós-evento.

O projeto foi inicialmente desenvolvido como **MVP de validação para investidores** (jan/2026) e agora entra na fase de **construção profissional**. A plataforma terá:

- **Web (Next.js)** — site institucional + builder de pedidos (público) + painel admin ERP (autenticado)
- **Mobile (React Native / Expo)** — app para clientes realizarem pedidos + app para operadores gerenciarem entregas
- **Backend (Supabase)** — PostgreSQL com RLS, Auth, Storage e Realtime

---

## Stack de Tecnologia

| Camada | Tecnologia |
|---|---|
| Web frontend | Next.js 16, React 19, TypeScript 5 |
| Estilização web | Tailwind CSS 4, Radix UI, Shadcn/UI |
| Mobile | React Native (Expo SDK 52+), NativeWind |
| Banco de dados | Supabase (PostgreSQL 15) |
| Autenticação | Supabase Auth |
| Validação | Zod |
| Formulários | React Hook Form |
| Testes web | Vitest + Testing Library + Playwright |
| Testes mobile | Jest + Detox |
| CI/CD | GitHub Actions |
| Deploy web | Vercel |
| Deploy mobile | EAS Build (Expo Application Services) |
| Monitoramento | Sentry + Vercel Analytics |
| Package manager | pnpm (workspaces) |

---

## Estrutura da Documentação

Os documentos devem ser lidos **em ordem** para onboarding completo, ou consultados individualmente conforme a tarefa em mãos.

| Arquivo | Tema | Prioridade |
|---|---|---|
| [01-visao-e-produto.md](./01-visao-e-produto.md) | Visão de negócio, personas, features e fases | Alta |
| [02-arquitetura-geral.md](./02-arquitetura-geral.md) | Monorepo, padrões, estrutura de pastas | Alta |
| [03-banco-de-dados.md](./03-banco-de-dados.md) | Schema Supabase, migrations, RLS | Alta |
| [04-autenticacao-e-seguranca.md](./04-autenticacao-e-seguranca.md) | Auth, roles, env vars, segurança | Alta |
| [05-frontend-web.md](./05-frontend-web.md) | Next.js, componentes, design system | Média |
| [06-mobile-react-native.md](./06-mobile-react-native.md) | Expo, navegação, telas, QR code | Média |
| [07-api-e-backend.md](./07-api-e-backend.md) | API routes, contratos, validação | Média |
| [08-testes.md](./08-testes.md) | Estratégia, ferramentas, cobertura | Média |
| [09-ci-cd-e-deploy.md](./09-ci-cd-e-deploy.md) | GitHub Actions, Vercel, EAS | Média |
| [10-monitoramento.md](./10-monitoramento.md) | Sentry, analytics, logs, alertas | Baixa |
| [11-roadmap-execucao.md](./11-roadmap-execucao.md) | Fases, prioridades, critérios de aceite | Alta |

---

## Estado Atual do Código (baseline)

### O que existe e funciona
- Site institucional completo (homepage com todas as seções)
- Builder de pedido em 5 etapas com cálculo de preço dinâmico
- API `POST /api/orders` com validação Zod e persistência no Supabase
- Painel admin: dashboard, kanban de pedidos, clientes, coolers
- Schema de banco de dados com RLS básica (4 scripts SQL)
- Autenticação Supabase SSR funcionando

### Débitos técnicos conhecidos (a resolver)
- `typescript.ignoreBuildErrors: true` no `next.config.mjs` — **erros TS sendo silenciados**
- `images.unoptimized: true` — otimização de imagens desabilitada
- Nome do pacote ainda é `my-v0-project` — renomear para `quem-fez-fez`
- Zero testes automatizados
- Zero CI/CD configurado
- Sem `README.md` na raiz
- Sem variáveis de ambiente documentadas (`.env.example`)
- RLS do Supabase usa políticas genéricas (sem granularidade por role)
- `SUPABASE_SERVICE_ROLE_KEY` usado em API route pública — necessita revisão
- Sem rate limiting nas rotas de API
- Sem tratamento de erros global

### Estrutura atual de pastas (monólito web)
```
/
├── app/              # Next.js App Router
├── components/       # React components
├── hooks/            # Custom hooks
├── lib/              # Utilities, constants, types, Supabase clients
├── scripts/          # SQL migrations
├── public/           # Static assets
└── docs/             # Esta documentação
```

---

## Regras de Trabalho para o Claude Code

1. **Sempre leia o arquivo relevante antes de editar.** Nunca assuma o conteúdo.
2. **Siga a ordem do roadmap** em `11-roadmap-execucao.md` ao implementar mudanças.
3. **Não silenciar erros TypeScript.** Se um erro existe, corrija-o.
4. **Cada PR/commit deve cobrir um único escopo** (uma feature, um fix, uma refatoração).
5. **Toda nova rota de API deve ter:** validação Zod, tratamento de erro, tipagem completa.
6. **Todo novo componente deve ter:** tipagem de props, sem `any`, sem `console.log`.
7. **Variáveis de ambiente** nunca devem ser hardcoded. Sempre via `process.env` com validação.
8. **Antes de criar um arquivo novo**, verifique se já existe algo similar em `components/`, `hooks/` ou `lib/`.
9. **Testes devem acompanhar** qualquer lógica de negócio nova (funções puras, API routes).
10. **Commits em inglês**, convenção `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

---

## Variáveis de Ambiente Obrigatórias

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=         # URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Chave anon (pública)
SUPABASE_SERVICE_ROLE_KEY=        # Chave service role (NUNCA expor no cliente)

# Sentry (após configurar monitoramento)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=              # URL base da aplicação (ex: https://quemfezfez.com.br)
```

Ver detalhes completos em [04-autenticacao-e-seguranca.md](./04-autenticacao-e-seguranca.md).

---

## Convenções de Nomenclatura

| Artefato | Convenção | Exemplo |
|---|---|---|
| Componentes React | PascalCase | `OrderCard.tsx` |
| Hooks | camelCase com prefixo `use` | `useOrderStatus.ts` |
| Utilitários/funções | camelCase | `formatCurrency.ts` |
| Constantes | UPPER_SNAKE_CASE | `MAX_GUESTS` |
| Tipos/Interfaces | PascalCase | `OrderStatus` |
| Arquivos de teste | mesmo nome + `.test.ts` | `formatCurrency.test.ts` |
| Rotas de API | kebab-case | `/api/orders/[id]/status` |
| Pastas | kebab-case | `order-builder/` |

---

## Contato e Repositório

- **Repositório:** `pedroluizchagas/thiaguindodevili`
- **Branch de desenvolvimento:** `claude/analyze-project-status-9TFYF` (temporário)
- **Branch principal:** `main`
- **Deploy web:** Vercel (a configurar)
- **Deploy mobile:** EAS Build (a configurar)
