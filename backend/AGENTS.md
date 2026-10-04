# Backend — FuBanking API

Express 5 + TypeScript + Supabase. Puertos: `:3001`, base `/api/v1`, smoke `GET /health`.

```txt
backend/src/
  app.ts                 # createApp(): helmet, cors(CLIENT_URL), json(limit 10kb), routes, errorHandler, 404
  server.ts              # listen + valida env al arrancar
  presentation/{routes,controllers,middlewares,validators}
  application/{use-cases,dtos,interfaces}
  domain/{entities,repositories,value-objects}
  infrastructure/{database,repositories/Supabase*,services}
  shared/{config/env.ts,errors,utils}  types/express.d.ts
  tests/{unit,auth,integration,fakes,helpers}   # canónico vitest
```

Prefijos en `presentation/routes/index.ts`:

`/auth /profile /accounts /payments /pockets /loans /transfers /cards /money-requests /notifications`

## Setup

```bash
cd backend && cp .env.example .env && npm i && npm run dev   # :3001
```

Env mínimo (ver `.env.example`): `PORT JWT_SECRET(≥16) SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY CLIENT_URL(http://localhost:3000)`.

⚠️ `shared/config/env.ts` (zod) hace `process.exit(1)` si falta env — en CI el `Jenkinsfile` genera un `.env` dummy para tests. Ojo al typo congelado `GMAIL_USSER` (doble S): existe igual en `.env.example`, `env.ts` y CI; no renombrar sin migrar los tres.

## Comandos

```bash
npm run dev | build | start          # tsx watch / tsc→dist / node dist/server.js
npm run test | test:watch | test:coverage   # vitest run (include src/tests/**, thresholds 85/80/85/85)
npm run test:loans                 # solo módulo créditos (unit/loan + integration/loan.http)
```

Legacy en retirada (no usar): `jest.config.ts`, `test:unit` (`run-unit.ts`), `test:coverage:bolsillos` (`c8` + `normalize-lcov.mjs`).

## Patrón nuevo endpoint

`routes/*.routes.ts` → validator zod → `controllers/*` → `application/use-cases/*` → repo `infrastructure/repositories/Supabase*` → dto. Respuesta siempre `{ success, message, data }` vía `errorHandler`. Auth: `authMiddleware` (JWT `Bearer`) y `adminMiddleware` donde aplique. Caso especial: `POST /auth/2fa/resend` lleva rate-limit.
Rate-limit (`createRateLimiter`, in-memory, 429 `RATE_LIMIT_EXCEEDED` + `Retry-After`): `POST /auth/login` (10/min por email+IP), `POST /loans/simulate` (30/min por usuario), `POST /loans` (10/min por usuario). `adminMiddleware` expone fábrica `createAdminMiddleware(repo?)` para tests HTTP con fakes.

Cada carpeta de `application/use-cases/{account,auth,card,loan,money-request,notification,payment,pocket,profile,transfer,user}/` espeja un `presentation/routes/*.routes.ts`.

## Límites

- `express.json({ limit: '10kb' })`, `cors({ origin: CLIENT_URL })` — no abrir.
- No exponer `service_role` fuera del backend; no loggear secrets.
- Tests con fakes de `src/tests/fakes/`; no tocar `supabase/migrations/` sin revisar.
- `tsconfig` excluye tests del build (`dist` solo código productivo).
