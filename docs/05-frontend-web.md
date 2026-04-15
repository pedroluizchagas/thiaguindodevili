# 05 — Frontend Web

> Next.js App Router, componentes, design system, estado e correções necessárias.

---

## Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 16.x | Framework React fullstack |
| React | 19.x | UI library |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 4.x | Utilitários de estilo |
| Radix UI | latest | Primitivos acessíveis |
| Shadcn/UI | New York | Componentes prontos sobre Radix |
| React Hook Form | 7.x | Formulários performáticos |
| Zod | 3.x | Validação de schemas |
| Lucide React | 0.45x | Ícones |
| next-themes | 0.4x | Troca de tema (dark/light) |
| Vercel Analytics | 1.3x | Analytics de página |

---

## Correções Obrigatórias (antes de qualquer feature nova)

### 1. Remover `ignoreBuildErrors`

```javascript
// next.config.mjs — ANTES (errado)
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
}

// next.config.mjs — DEPOIS (correto)
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [], // adicionar domínios externos se necessário
  },
}
export default nextConfig
```

### 2. Renomear o projeto no `package.json`

```json
{
  "name": "@qff/web",
  "version": "1.0.0"
}
```

### 3. Adicionar `.env.example`
Ver [04-autenticacao-e-seguranca.md](./04-autenticacao-e-seguranca.md) para conteúdo completo.

### 4. Criar `README.md` na raiz
Instruções de setup local, variáveis de ambiente, como rodar e como fazer deploy.

---

## Roteamento (App Router)

```
app/
├── layout.tsx              ← RootLayout: ThemeProvider, Analytics, Toaster, fontes
├── globals.css             ← Variáveis CSS + reset
├── page.tsx                ← Homepage (Server Component)
│
├── admin/
│   ├── layout.tsx          ← AdminLayout: verifica auth → sidebar + header
│   ├── page.tsx            ← /admin → Dashboard
│   ├── orders/
│   │   └── page.tsx        ← /admin/orders → Kanban
│   ├── coolers/
│   │   └── page.tsx        ← /admin/coolers → Tabela + gestão
│   ├── customers/
│   │   └── page.tsx        ← /admin/customers → Tabela
│   └── login/
│       └── page.tsx        ← /admin/login (sem sidebar)
│
└── api/
    └── orders/
        └── route.ts        ← POST /api/orders
```

### Novas rotas a criar

```
app/
├── pedido/
│   └── [id]/
│       └── page.tsx        ← Confirmação + rastreamento público (Fase 2)
└── admin/
    ├── orders/
    │   └── [id]/
    │       └── page.tsx    ← Detalhe do pedido (Fase 2)
    └── settings/
        └── page.tsx        ← Configurações (apenas admin) (Fase 3)
```

---

## Componentes

### Hierarquia

```
components/
├── ui/                     ← Shadcn/UI — NÃO editar diretamente
│   └── [40+ componentes]
│
├── layout/                 ← Estruturais (presentes em múltiplas páginas)
│   ├── header.tsx          ← Navegação pública
│   └── footer.tsx          ← Rodapé
│
├── sections/               ← Seções da homepage (Server Components)
│   ├── hero-section.tsx
│   ├── how-it-works-section.tsx
│   ├── differentials-section.tsx
│   ├── builder-section.tsx ← Wrapper que carrega o builder client-side
│   ├── combos-section.tsx
│   ├── testimonials-section.tsx
│   ├── franchise-section.tsx
│   ├── cta-section.tsx
│   └── contact-section.tsx
│
├── builder/                ← Fluxo de pedido (Client Components)
│   ├── builder-context.tsx ← Context Provider com estado do pedido
│   ├── resenha-builder.tsx ← Componente raiz do builder
│   ├── progress-bar.tsx    ← Barra de progresso dos steps
│   ├── price-display.tsx   ← Exibição do preço em tempo real
│   └── steps/
│       ├── step-guests.tsx
│       ├── step-meat.tsx
│       ├── step-beverages.tsx
│       ├── step-services.tsx
│       └── step-checkout.tsx
│
└── admin/                  ← Painel admin (mix de Server e Client)
    ├── admin-header.tsx
    ├── admin-sidebar.tsx
    ├── dashboard-stats.tsx
    ├── recent-orders.tsx
    ├── orders-kanban.tsx   ← Client (drag & drop futuro)
    ├── customers-table.tsx
    ├── coolers-table.tsx
    ├── cooler-status.tsx
    ├── cooler-stats.tsx
    └── add-cooler-dialog.tsx
```

### Convenções de componentes

```typescript
// Sempre tipagem explícita das props
interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

// Exportação nomeada (não default) para facilitar tree-shaking e refactoring
export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status]
  return (
    <span className={cn("rounded-full px-2 py-1 text-xs font-medium", config.bgColor, config.color, className)}>
      {config.label}
    </span>
  )
}
```

---

## Design System

### Cores (variáveis CSS — `globals.css`)

O projeto usa `next-themes` com variáveis CSS no formato HSL para suporte a dark/light mode.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: /* vermelho/laranja do churrasco */;
  --primary-foreground: 0 0% 98%;
  /* ... demais tokens */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}
```

### Utilitário `cn()`

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Usar `cn()` sempre que houver classes condicionais ou merge de className externo.

### Tipografia
- Fonte principal: configurar via `next/font/google` (ex: Inter ou similar)
- Hierarquia: `text-4xl font-bold` para H1, `text-2xl font-semibold` para H2, etc.

### Componentes Shadcn disponíveis
O projeto já possui 40+ componentes Shadcn instalados. Antes de criar um componente do zero, verificar se já existe em `components/ui/`.

---

## Estado do Builder

O builder de pedido usa **Context API** (`BuilderContext`):

```typescript
// Estado gerenciado
interface BuilderState {
  currentStep: number         // 1–5
  guests: number              // 4–50
  selectedMeat: MeatOption | null
  beverages: Map<string, number>  // id → quantidade
  selectedServices: string[]      // ids dos serviços
  selectedAccompaniments: string[] // ids dos acompanhamentos
  customerData: CheckoutFormData | null
}

// Ações disponíveis
interface BuilderActions {
  setStep: (step: number) => void
  setGuests: (n: number) => void
  selectMeat: (meat: MeatOption) => void
  setBeverageQuantity: (id: string, qty: number) => void
  toggleService: (id: string) => void
  toggleAccompaniment: (id: string) => void
  setCustomerData: (data: CheckoutFormData) => void
  reset: () => void
}
```

O cálculo de preço é derivado do estado — usar `useMemo` para evitar recálculo desnecessário.

---

## Formulários

Todos os formulários usam **React Hook Form + Zod**:

```typescript
// Definir schema no packages/shared
export const CheckoutSchema = z.object({
  name: z.string().trim().min(2, "Nome obrigatório").max(120),
  whatsapp: z.string().trim().min(8, "WhatsApp inválido").max(30),
  address: z.string().trim().min(5, "Endereço obrigatório").max(250),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
})

// Usar no componente
const form = useForm<z.infer<typeof CheckoutSchema>>({
  resolver: zodResolver(CheckoutSchema),
  defaultValues: { name: "", whatsapp: "", ... },
})
```

---

## Performance

### Imagens
Com `unoptimized: true` removido, usar `next/image` corretamente:

```tsx
import Image from "next/image"

<Image
  src="/wagyu-tomahawk-steak.jpg"
  alt="Kit A Lenda — Wagyu e Tomahawk"
  width={600}
  height={400}
  priority    // apenas para imagens above-the-fold (hero)
  loading="lazy"  // padrão para demais
/>
```

### Code splitting
- Server Components não são incluídos no bundle do cliente
- Usar `dynamic()` para componentes pesados que não são críticos no carregamento inicial:

```typescript
import dynamic from "next/dynamic"

const OrdersKanban = dynamic(() => import("@/components/admin/orders-kanban"), {
  loading: () => <KanbanSkeleton />,
})
```

### Métricas alvo (Core Web Vitals)
| Métrica | Alvo |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID / INP | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTFB | < 800ms |

---

## SEO

### Meta tags a implementar em `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: {
    default: "Quem Fez, Fez! | Delivery de Churrasco Premium",
    template: "%s | Quem Fez, Fez!",
  },
  description: "Delivery de churrasco premium com cooler completo. Carnes selecionadas, bebidas geladas e serviço impecável.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Quem Fez, Fez!",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

### Arquivos a criar
- `app/sitemap.ts` — sitemap automático do Next.js
- `app/robots.ts` — configuração de crawlers
- `public/og-image.jpg` — imagem Open Graph (1200×630px)
