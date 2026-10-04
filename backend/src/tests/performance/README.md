# Performance — módulo créditos

Presupuesto explícito + mediana (equivalente a `performance-testing/` del profesor).

```bash
npm run test:performance         # esta carpeta (sin backend vivo, apta para CI)
k6 run ../../../scripts/performance/loans-load.js   # carga concurrente (requiere back + FUBANKING_JWT)
```

| Archivo | Cubre |
|---|---|
| `SimulateLoan.performance.test.ts` | cálculo puro: correctitud por repetición + mediana de 5 <500ms |
