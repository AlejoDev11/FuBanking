# Security — módulo créditos (+ login)

Security testing vía HTTP (equivalente a `security-testing/` del profesor: tablas negativas, 401/403/400/429).

```bash
npm run test:security            # esta carpeta
```

| Archivo | Cubre |
|---|---|
| `loan.security.test.ts` | aislamiento `/me` por usuario, 401 sin token/inválido, 403 no-admin en `/admin/*`, fuzz 400 (`amount/installments/annualRate`, id no-uuid), 429 contra la config real (`simulateLimiter` 30/min, `createLoanLimiter` 10/min, `loginRateLimiter` 10/min email+IP) |
