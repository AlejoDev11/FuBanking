# Scripts FuBanking

| Script | Uso |
|---|---|
| `regression.sh` | CI/Linux: `sh scripts/regression.sh [backend\|frontend]` |
| `regression.ps1` | Windows local (misma suite) |
| `utils/make-admin.ts` | Otorga rol admin por email. Requiere `backend/.env` con `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` |
| `performance/measure-*.ts` | Medición genérica de tiempos/recursos |
| `performance/backend-measure-*.ts` | Variante backend; `test-performance.ts` orquesta |
