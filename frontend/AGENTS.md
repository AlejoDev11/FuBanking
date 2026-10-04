# Frontend — FuBanking Web

Next.js 16 App Router + React 19 + Tailwind 4 + axios + react-hook-form/zod. Puerto `:3000`, `output: standalone`, API en `NEXT_PUBLIC_API_URL || http://localhost:3001/api/v1` (**build-time**: el `Dockerfile` lo fija vía `ARG`).

```txt
frontend/src/
  app/{(auth)/{login,register,forgot-password,reset-password,verify-two-factor},
        (dashboard)/{accounts,transfers,history,requests,cards,loans,notifications,pockets,profile,admin/loans}}
  features/<mod>/{components,hooks,services,types(,schemas)}   # handlers solo en pockets/
  shared/{components/{feedback/ToastProvider,layout,ui},hooks/useAuth.tsx,
          services/api.client.ts,utils/{cn,format,dateUtils,getMessage,secureRandom}}
  tests/unit/          # canónico vitest (jsdom, setup src/tests/unit/setup.ts, alias @)
frontend/middleware.ts # cookie `token` → /login; deja pasar `*.*` (estáticos public/) y rutas auth
```

## Setup

```bash
cd frontend && npm i && npm run dev   # :3000
```

Para apuntar a otro back: `frontend/.env.local` con `NEXT_PUBLIC_API_URL=...` (ver `.env.example`).

## Comandos

```bash
npm run dev | build | start | lint
npm run test | test:watch | test:coverage   # vitest run
```

Legacy en retirada: `jest.config.ts`, `test:unit` (`run-unit.ts`). Lint focalizado: `npx eslint <archivos>` (el lint global arrastra deuda previa).

## Patrones

**API client** (`@/shared/services/api.client.ts`): el interceptor `response` ya devuelve `response.data` (el cuerpo `{success,message,data}`); cada servicio hace un segundo unwrap del wrapper:

```ts
import { apiClient } from '@/shared/services/api.client';
const r = await apiClient.get<PocketItem[]>('/pockets/account/1');
return r.data; // r = cuerpo {success,message,data}; .data = payload
```

Auth: `middleware.ts` lee cookie `token`, pero `api.client` inyecta `localStorage.getItem('token')` — inconsistencia conocida; al tocar auth, mantener ambos hasta unificar (ver Límites).

**Toasts**: `import { useToast } from '@/shared/components/feedback/ToastProvider'` → `toast.success|error|info|warning(título, detalle)`. Inline para errores de formulario, toast para resultado; nunca `alert()`.

**Formularios/estilo**: `zod + @hookform/resolvers`, imports con `@/` (`@/features/...`, `@/shared/...`), iconos `lucide-react`, tokens `bg-card border foreground muted primary`. Sin landing en rutas app, sin tarjeta-dentro-de-tarjeta, mobile responsive.

## Features ↔ endpoints

| Feature | Endpoint |
|---|---|
| `account` | `/accounts` |
| `transfer` | `/transfers` |
| `pockets/` (plural) | `/pockets` |
| `loans` | `/loans` |
| `cards` | `/cards` |
| `money-request` | `/money-requests` |
| `notification` | `/notifications` |
| `auth/profile/admin` | `/auth /profile` |
| `payment` | **pendiente** → `/payments` (crear `features/payment/`, no duplicar en `transfer`) |

## Límites

- Usar **`features/pockets/`** (plural, coincide con `/pockets`); `features/pocket/` eliminado.
- No inventar `resultingBalance` en UI si el back no lo devuelve.
- Solo `NEXT_PUBLIC_*` llega al browser; jamás pegar secrets.
