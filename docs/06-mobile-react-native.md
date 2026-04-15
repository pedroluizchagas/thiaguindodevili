# 06 — Mobile React Native (Expo)

> Setup do app mobile, estrutura de navegação, telas, integração com Supabase e funcionalidades nativas.

---

## Stack Mobile

| Tecnologia | Versão | Uso |
|---|---|---|
| Expo SDK | 52+ | Runtime e ferramentas |
| Expo Router | 4.x | Navegação file-based |
| React Native | 0.76+ | UI nativa |
| NativeWind | 4.x | Tailwind CSS no RN |
| @supabase/supabase-js | latest | Cliente Supabase |
| expo-secure-store | latest | Armazenamento seguro de tokens |
| expo-camera | latest | Scanner de QR code |
| expo-notifications | latest | Push notifications |
| expo-location | latest | GPS para rota de entrega |
| Zustand | 5.x | State management global |
| React Hook Form + Zod | latest | Formulários |

---

## Configuração Inicial

### Criar o projeto Expo

```bash
cd apps/
npx create-expo-app@latest mobile --template tabs
cd mobile
```

### Dependências principais a instalar

```bash
npx expo install expo-router expo-secure-store expo-camera expo-notifications expo-location
pnpm add nativewind zustand @supabase/supabase-js react-hook-form zod @hookform/resolvers
pnpm add -D tailwindcss@3.x  # NativeWind 4 usa Tailwind 3
```

### `app.json` (configuração Expo)

```json
{
  "expo": {
    "name": "Quem Fez, Fez!",
    "slug": "quem-fez-fez",
    "version": "1.0.0",
    "scheme": "quemfezfez",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#1a0a00"
    },
    "ios": {
      "bundleIdentifier": "br.com.quemfezfez",
      "supportsTablet": false,
      "infoPlist": {
        "NSCameraUsageDescription": "Necessário para escanear o QR code do cooler",
        "NSLocationWhenInUseUsageDescription": "Necessário para otimizar rotas de entrega"
      }
    },
    "android": {
      "package": "br.com.quemfezfez",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1a0a00"
      },
      "permissions": ["CAMERA", "ACCESS_FINE_LOCATION"]
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      ["expo-notifications", { "icon": "./assets/notification-icon.png" }],
      ["expo-camera", { "cameraPermission": "Necessário para escanear QR codes" }]
    ],
    "extra": {
      "supabaseUrl": "process.env.EXPO_PUBLIC_SUPABASE_URL",
      "supabaseAnonKey": "process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY",
      "eas": { "projectId": "xxx-yyy-zzz" }
    }
  }
}
```

### Variáveis de ambiente (`.env`)

No Expo, variáveis com prefixo `EXPO_PUBLIC_` são expostas no bundle:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJh...
EXPO_PUBLIC_APP_URL=https://quemfezfez.com.br
```

---

## Integração com Supabase no Mobile

### Cliente Supabase com armazenamento seguro

```typescript
// apps/mobile/lib/supabase.ts
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"
import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

// Adapter que usa SecureStore no nativo e AsyncStorage na web
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === "web") return AsyncStorage.getItem(key)
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === "web") return AsyncStorage.setItem(key, value)
    return SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    if (Platform.OS === "web") return AsyncStorage.removeItem(key)
    return SecureStore.deleteItemAsync(key)
  },
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

---

## Estrutura de Navegação (Expo Router)

```
app/
├── _layout.tsx               ← Root: ThemeProvider, AuthProvider, configuração inicial
├── index.tsx                 ← Redirect baseado em auth + role
│
├── (public)/                 ← Rotas sem autenticação
│   ├── _layout.tsx           ← Stack navigation
│   ├── explore.tsx           ← Tela de explorar kits (landing mobile)
│   └── builder/
│       ├── _layout.tsx       ← BuilderProvider
│       ├── guests.tsx        ← Step 1: Quantidade de pessoas
│       ├── meat.tsx          ← Step 2: Kit de carne
│       ├── beverages.tsx     ← Step 3: Bebidas
│       ├── services.tsx      ← Step 4: Serviços
│       ├── checkout.tsx      ← Step 5: Dados + finalizar
│       └── confirmation.tsx  ← Confirmação do pedido
│
├── (customer)/               ← App do cliente (autenticado)
│   ├── _layout.tsx           ← Tab navigation: Pedidos | Perfil
│   ├── orders/
│   │   ├── index.tsx         ← Lista de pedidos do cliente
│   │   └── [id].tsx          ← Detalhe + rastreamento em tempo real
│   └── profile.tsx           ← Editar perfil, logout
│
├── (operator)/               ← App do operador/motorista (role: operator|driver)
│   ├── _layout.tsx           ← Tab navigation: Hoje | Scanner | Perfil
│   ├── daily.tsx             ← Pedidos do dia (agrupados por status)
│   ├── order/
│   │   └── [id].tsx          ← Detalhe com ações de status
│   ├── scan.tsx              ← Scanner QR code do cooler
│   └── profile.tsx
│
└── auth/
    ├── login.tsx             ← Login (para operadores/clientes)
    └── callback.tsx          ← OAuth callback (deep link handler)
```

---

## Gerenciamento de Estado (Zustand)

```typescript
// apps/mobile/stores/auth-store.ts
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Profile } from "@qff/shared/types"

interface AuthState {
  profile: Profile | null
  isLoading: boolean
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile: null,
      isLoading: true,
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
```

```typescript
// apps/mobile/stores/builder-store.ts
import { create } from "zustand"
import type { MeatOption } from "@qff/shared/types"

interface BuilderStore {
  guests: number
  selectedMeat: MeatOption | null
  beverages: Record<string, number>
  selectedServices: string[]
  selectedAccompaniments: string[]
  setGuests: (n: number) => void
  selectMeat: (meat: MeatOption) => void
  setBeverageQty: (id: string, qty: number) => void
  toggleService: (id: string) => void
  reset: () => void
}
```

---

## Telas Detalhadas

### Tela: `explore.tsx` (landing mobile)
- Header com logo
- Cards dos 3 kits de carne com imagem, nome, descrição e preço/pessoa
- Botão "Montar meu churrasco" → navega para `builder/guests`
- Seção de serviços adicionais
- Footer com WhatsApp de contato

### Tela: `builder/guests.tsx`
- Slider ou +/- para selecionar número de convidados (4–50)
- Preview do preço estimado (mínimo com kit raiz)
- Botão "Próximo"

### Tela: `builder/meat.tsx`
- Lista vertical dos 3 kits
- Card expansível com itens do kit
- Preço/pessoa e preço total para a quantidade escolhida
- Seleção com radio (um kit por vez)

### Tela: `builder/beverages.tsx`
- Grid de bebidas com imagem, nome e preço/unidade
- Stepper (+/-) para quantidade de cada item
- Total de bebidas em tempo real

### Tela: `builder/services.tsx`
- Cards de serviços adicionais (acendimento, limpeza)
- Toggle para selecionar/deselecionar
- Cards de acompanhamentos com checkbox

### Tela: `builder/checkout.tsx`
- Formulário com React Hook Form:
  - Nome, WhatsApp (com máscara), Endereço
  - Date picker nativo para data de entrega
  - Time picker nativo para horário
- Resumo do pedido (collapsible)
- Preço total final
- Botão "Confirmar Pedido" → POST /api/orders

### Tela: `operator/scan.tsx` (Scanner QR)
```typescript
import { CameraView, useCameraPermissions } from "expo-camera"

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return
    // Validar formato QFF-XXX
    if (!/^QFF-\d{3}$/.test(data)) {
      Alert.alert("QR inválido", "Este não é um cooler da Quem Fez, Fez!")
      return
    }
    setScanned(true)
    // Buscar cooler no Supabase e navegar para detalhe
    router.push(`/operator/cooler/${data}`)
  }

  return (
    <CameraView
      style={{ flex: 1 }}
      barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      onBarcodeScanned={handleBarCodeScanned}
    />
  )
}
```

---

## Push Notifications

### Configuração

```typescript
// apps/mobile/lib/notifications.ts
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { supabase } from "./supabase"

export async function registerForPushNotifications(userId: string) {
  if (!Device.isDevice) return // não funciona no simulador

  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== "granted") return

  const token = (await Notifications.getExpoPushTokenAsync()).data

  // Salvar token no Supabase (tabela push_tokens — Fase 3)
  await supabase.from("push_tokens").upsert({
    user_id: userId,
    token,
    platform: Platform.OS,
  })
}
```

### Eventos que disparam notificação (para o cliente)
- `in_route` → "Seu churrasco está a caminho!"
- `delivered` → "Churrasqueira acesa! Bom apetite!"
- `scheduled_pickup` → "Recolhimento amanhã às HH:MM"

### Tabela `push_tokens` a criar (migration 009)
```sql
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);
```

---

## NativeWind (estilização)

```typescript
// tailwind.config.js (apps/mobile)
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#c2410c",   // laranja churrasco
        "primary-dark": "#9a3412",
      },
    },
  },
}
```

```tsx
// Uso com NativeWind
<View className="flex-1 bg-background p-4">
  <Text className="text-2xl font-bold text-foreground">Meus Pedidos</Text>
  <TouchableOpacity className="bg-primary rounded-xl p-4 mt-4 active:opacity-80">
    <Text className="text-white font-semibold text-center">Novo Pedido</Text>
  </TouchableOpacity>
</View>
```

---

## EAS Build e Deploy

Ver detalhes completos em [09-ci-cd-e-deploy.md](./09-ci-cd-e-deploy.md).

### `eas.json` (configuração básica)

```json
{
  "cli": { "version": ">= 7.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "conta@quemfezfez.com.br" },
      "android": { "serviceAccountKeyPath": "./google-service-account.json" }
    }
  }
}
```

---

## Deep Links

Com `scheme: "quemfezfez"` configurado no `app.json`:

```
quemfezfez://pedido/12345       → Abre detalhe do pedido
quemfezfez://builder/guests     → Inicia builder
quemfezfez://auth/callback      → Callback OAuth
```

### Universal Links (iOS) / App Links (Android)
Configurar o domínio `quemfezfez.com.br` para abrir o app diretamente quando o link é compartilhado.
