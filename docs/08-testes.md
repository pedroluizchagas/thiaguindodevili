# 08 — Testes

> Estratégia, ferramentas, exemplos e metas de cobertura para web e mobile.

---

## Filosofia

Testar **comportamento**, não implementação. Prioridade:

1. **Lógica de negócio pura** (funções de cálculo, validação) — maior ROI, mais fáceis de manter
2. **API routes** — garantem que o contrato do backend não quebra
3. **Componentes críticos** — o builder de pedido, formulários, estados de erro
4. **E2E** — fluxo completo de criação de pedido (happy path + erros)

---

## Stack de Testes

### Web (`apps/web`)

| Ferramenta | Tipo | Uso |
|---|---|---|
| **Vitest** | Unit/Integration | Funções puras, utils, API routes |
| **@testing-library/react** | Component | Componentes React |
| **@testing-library/user-event** | Component | Simulação de interação do usuário |
| **Playwright** | E2E | Fluxo completo no browser |
| **MSW (Mock Service Worker)** | Mocking | Mock de chamadas ao Supabase em testes |

### Mobile (`apps/mobile`)

| Ferramenta | Tipo | Uso |
|---|---|---|
| **Jest** | Unit/Integration | Funções, stores Zustand |
| **@testing-library/react-native** | Component | Componentes RN |
| **Detox** | E2E | Testes em emulador/dispositivo |

### Compartilhado (`packages/shared`)

| Ferramenta | Tipo |
|---|---|
| **Vitest** | Unit — schemas Zod, utils de cálculo |

---

## Configuração (Web)

### Instalar dependências

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  msw playwright @playwright/test
```

### `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: ["components/ui/**", "*.config.*", "**/*.d.ts"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./") },
  },
})
```

### `src/test/setup.ts`

```typescript
import "@testing-library/jest-dom"
import { server } from "./mocks/server"

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## Testes Unitários — Exemplos

### Lógica de cálculo de preço

```typescript
// packages/shared/src/utils/__tests__/pricing.test.ts
import { describe, it, expect } from "vitest"
import { calculateOrderTotal } from "../pricing"
import { MEAT_OPTIONS, BEVERAGE_OPTIONS } from "../../constants"

describe("calculateOrderTotal", () => {
  it("calcula corretamente para kit raiz com 10 pessoas", () => {
    const result = calculateOrderTotal({
      guests: 10,
      meatId: "raiz",    // R$ 45/pessoa
      beverages: [{ id: "heineken", quantity: 20 }],  // 20 * R$ 7,50 = R$ 150
      services: [],
      accompaniments: [],
    })
    // 10 * 45 + 150 = R$ 600
    expect(result.subtotal).toBe(600)
    expect(result.total).toBe(600)
  })

  it("aplica clamp nos convidados (mínimo 4)", () => {
    const result = calculateOrderTotal({ guests: 2, meatId: "raiz", beverages: [], services: [], accompaniments: [] })
    expect(result.meatWeight).toBe(1.6) // 4 * 400g
  })

  it("inclui serviços no total", () => {
    const result = calculateOrderTotal({
      guests: 10, meatId: "raiz",
      beverages: [], services: ["acendimento"],  // R$ 89
      accompaniments: [],
    })
    expect(result.subtotal).toBe(10 * 45 + 89) // R$ 539
  })
})
```

### Validação Zod

```typescript
// packages/shared/src/utils/__tests__/validation.test.ts
import { describe, it, expect } from "vitest"
import { CreateOrderSchema } from "../validation"

describe("CreateOrderSchema", () => {
  const validInput = {
    customer: { name: "João Silva", whatsapp: "11999998888", address: "Rua A, 100, Centro", date: "2026-06-15", time: "18:00" },
    selection: { guests: 10, meatId: "raiz", beverages: [], services: [], accompaniments: [] },
  }

  it("aceita input válido", () => {
    expect(CreateOrderSchema.safeParse(validInput).success).toBe(true)
  })

  it("rejeita meatId inválido", () => {
    const input = { ...validInput, selection: { ...validInput.selection, meatId: "inexistente" } }
    expect(CreateOrderSchema.safeParse(input).success).toBe(false)
  })

  it("rejeita data em formato inválido", () => {
    const input = { ...validInput, customer: { ...validInput.customer, date: "15/06/2026" } }
    expect(CreateOrderSchema.safeParse(input).success).toBe(false)
  })
})
```

---

## Testes de Componentes — Exemplos

### Step de seleção de convidados

```typescript
// components/builder/steps/__tests__/step-guests.test.tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StepGuests } from "../step-guests"
import { BuilderProvider } from "../../builder-context"

function renderWithProvider(ui: React.ReactElement) {
  return render(<BuilderProvider>{ui}</BuilderProvider>)
}

describe("StepGuests", () => {
  it("renderiza o seletor de quantidade", () => {
    renderWithProvider(<StepGuests />)
    expect(screen.getByRole("spinbutton", { name: /convidados/i })).toBeInTheDocument()
  })

  it("exibe preço mínimo estimado", () => {
    renderWithProvider(<StepGuests />)
    // Com valor default (10 pessoas) e kit raiz (R$45/pessoa) = R$450
    expect(screen.getByText(/R\$ 450/)).toBeInTheDocument()
  })

  it("botão próximo fica desabilitado se guests < 4", async () => {
    const user = userEvent.setup()
    renderWithProvider(<StepGuests />)
    const input = screen.getByRole("spinbutton")
    await user.clear(input)
    await user.type(input, "2")
    expect(screen.getByRole("button", { name: /próximo/i })).toBeDisabled()
  })
})
```

### Formulário de checkout

```typescript
// components/builder/steps/__tests__/step-checkout.test.tsx
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StepCheckout } from "../step-checkout"

describe("StepCheckout", () => {
  it("exibe erros de validação ao submeter com campos vazios", async () => {
    const user = userEvent.setup()
    render(<StepCheckout />)
    await user.click(screen.getByRole("button", { name: /confirmar/i }))
    expect(await screen.findByText(/nome obrigatório/i)).toBeInTheDocument()
  })
})
```

---

## Testes de API Routes

```typescript
// app/api/orders/__tests__/route.test.ts
import { describe, it, expect, vi } from "vitest"
import { POST } from "../route"
import { NextRequest } from "next/server"

// Mock do Supabase admin client
vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ order: () => ({ limit: () => ({ data: [], error: null }) }) }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: { id: "uuid-1", order_number: 42 }, error: null }) }) }),
    }),
  }),
}))

describe("POST /api/orders", () => {
  it("retorna 400 se body for inválido", async () => {
    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify({ invalid: true }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("retorna 201 com pedido válido", async () => {
    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify({
        customer: { name: "Test", whatsapp: "11999998888", address: "Rua A, 1, Centro", date: "2026-06-15", time: "18:00" },
        selection: { guests: 10, meatId: "raiz", beverages: [], services: [], accompaniments: [] },
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toHaveProperty("orderNumber")
  })
})
```

---

## Testes E2E com Playwright

```typescript
// e2e/order-flow.spec.ts
import { test, expect } from "@playwright/test"

test.describe("Fluxo de criação de pedido", () => {
  test("cliente consegue criar um pedido completo", async ({ page }) => {
    await page.goto("/")

    // Navegar até o builder
    await page.getByRole("button", { name: /montar meu churrasco/i }).click()

    // Step 1: convidados
    await page.getByRole("spinbutton", { name: /convidados/i }).fill("15")
    await page.getByRole("button", { name: /próximo/i }).click()

    // Step 2: carne
    await page.getByText("O Padrão Ouro").click()
    await page.getByRole("button", { name: /próximo/i }).click()

    // Step 3: bebidas
    await page.getByTestId("beverage-heineken-increase").click()
    await page.getByRole("button", { name: /próximo/i }).click()

    // Step 4: serviços
    await page.getByRole("button", { name: /próximo/i }).click()

    // Step 5: checkout
    await page.getByLabel(/seu nome/i).fill("João Teste")
    await page.getByLabel(/whatsapp/i).fill("11999998888")
    await page.getByLabel(/endereço/i).fill("Rua das Acácias, 100, Jardim Europa")
    await page.getByLabel(/data/i).fill("2026-06-20")
    await page.getByLabel(/horário/i).fill("18:00")
    await page.getByRole("button", { name: /confirmar pedido/i }).click()

    // Confirmação
    await expect(page.getByText(/pedido confirmado/i)).toBeVisible()
    await expect(page.getByText(/QFF-/)).toBeVisible()
  })

  test("exibe erro ao submeter com data no passado", async ({ page }) => {
    await page.goto("/")
    // ... navegar até o step 5
    await page.getByLabel(/data/i).fill("2020-01-01")
    await page.getByRole("button", { name: /confirmar pedido/i }).click()
    await expect(page.getByText(/data inválida/i)).toBeVisible()
  })
})
```

### `playwright.config.ts`

```typescript
import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## Scripts de Teste

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Metas de Cobertura

| Área | Meta de cobertura | Prioridade |
|---|---|---|
| `packages/shared/utils/` | 90% | Alta |
| `packages/shared/utils/validation` | 95% | Alta |
| `app/api/` (API routes) | 80% | Alta |
| `components/builder/` | 70% | Média |
| `components/admin/` | 50% | Baixa |
| `components/sections/` | 20% | Baixa |

---

## CI Integration

Os testes rodam automaticamente no CI em cada PR. Ver [09-ci-cd-e-deploy.md](./09-ci-cd-e-deploy.md) para o workflow completo.

```yaml
# Etapas no CI:
# 1. pnpm test:coverage       → unit + integration (com relatório de coverage)
# 2. pnpm test:e2e            → E2E com servidor de preview
# 3. Falha se cobertura < thresholds definidos no vitest.config.ts
```
