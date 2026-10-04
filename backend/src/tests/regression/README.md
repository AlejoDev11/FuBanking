# Regression — módulo créditos

Re-ejecución por contrato HTTP (equivalente a `regression-testing/` del profesor: AAA + FIRST).

```bash
npm run test:regression          # esta carpeta
npm run test:loans               # regression + resto de specs loans
```

| Archivo | Cubre |
|---|---|
| `loan.regression.test.ts` | `POST /simulate` 200, `POST /` 201 PENDING, duplicado 400 `LOAN_ALREADY_PENDING`, flujo admin approve/reject vía `helpers/createLoanTestApp.ts` (repos en memoria) |
