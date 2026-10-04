# Scripts FuBanking

| Script | Uso |
|---|---|
| `regression.sh` | CI/Linux: `sh scripts/regression.sh [backend\|frontend]` |
| `regression.ps1` | Windows local (misma suite) |
| `utils/make-admin.ts` | Otorga rol admin por email. Requiere `backend/.env` con `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` |
| `performance/measure-response-times.ts` | Tiempos HTTP endpoints loans (F01–F05, 3 warm-up + 20 reps, avg/min/max/p50/p95 + SLOs p95, exit 1 si falla). Requiere back vivo + semillas perf |
| `performance/measure-resources.ts` | CPU/RSS del proceso node vía PowerShell (solo Windows) sobre la misma matriz loans |
| `performance/loans-load.js` | Carga concurrente k6 (VUs, p95<500ms lectura). Requiere k6 + back vivo |
