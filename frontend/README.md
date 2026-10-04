# Frontend FuBanking

Next.js 16 + React 19 (`:3000`, `output: standalone`).

```bash
npm i && npm run dev
npm run build && npm start
npm run test               # vitest
npm run test:coverage      # vitest con cobertura
```

API: `NEXT_PUBLIC_API_URL` (ver `.env.example`; es build-time vía `ARG` en `Dockerfile`).
Detalle de rutas y patrones: `AGENTS.md`.
