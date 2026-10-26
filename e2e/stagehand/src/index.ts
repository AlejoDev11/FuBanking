import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { runLoansSimulatorScenario } from './scenarios/01-loans-simulator.js';
import { runLoansRequirementsScenario } from './scenarios/02-loans-requirements.js';
import { runAdminApprovalScenario } from './scenarios/03-admin-approval.js';

async function main() {
  console.log('\n\x1b[1m\x1b[35m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m   FUBANKING - SUITE DE TESTING E2E CON STAGEHAND E IA (CRÉDITOS)       \x1b[0m');
  console.log('\x1b[1m\x1b[35m       Capacidades: ACT, OBSERVE, EXTRACT con MODEL ROUTING             \x1b[0m');
  console.log('\x1b[1m\x1b[35m========================================================================\x1b[0m\n');

  const overallResults: Array<{ name: string; status: 'PASSED' | 'FAILED'; error?: string; durationMs: number }> = [];
  const globalStart = Date.now();

  // Escenario 1
  let tStart = Date.now();
  try {
    await runLoansSimulatorScenario();
    overallResults.push({ name: 'Escenario 1 (act + extract): Simulador de Créditos', status: 'PASSED', durationMs: Date.now() - tStart });
  } catch (err: any) {
    overallResults.push({ name: 'Escenario 1 (act + extract): Simulador de Créditos', status: 'FAILED', error: err.message, durationMs: Date.now() - tStart });
  }

  // Escenario 2
  tStart = Date.now();
  try {
    await runLoansRequirementsScenario();
    overallResults.push({ name: 'Escenario 2 (observe): Requisitos de Elegibilidad', status: 'PASSED', durationMs: Date.now() - tStart });
  } catch (err: any) {
    overallResults.push({ name: 'Escenario 2 (observe): Requisitos de Elegibilidad', status: 'FAILED', error: err.message, durationMs: Date.now() - tStart });
  }

  // Escenario 3
  tStart = Date.now();
  try {
    await runAdminApprovalScenario();
    overallResults.push({ name: 'Escenario 3 (act + observe + extract): Auditoría de Administración', status: 'PASSED', durationMs: Date.now() - tStart });
  } catch (err: any) {
    overallResults.push({ name: 'Escenario 3 (act + observe + extract): Auditoría de Administración', status: 'FAILED', error: err.message, durationMs: Date.now() - tStart });
  }

  const totalDuration = Date.now() - globalStart;

  console.log('\n\x1b[1m\x1b[34m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[34m                   RESUMEN GLOBAL DE EJECUCIÓN STAGEHAND                 \x1b[0m');
  console.log('\x1b[1m\x1b[34m========================================================================\x1b[0m');

  for (const res of overallResults) {
    const badge = res.status === 'PASSED' ? '\x1b[32m[PASSED]\x1b[0m' : '\x1b[31m[FAILED]\x1b[0m';
    console.log(`${badge} ${res.name} (\x1b[33m${res.durationMs}ms\x1b[0m)`);
    if (res.error) {
      console.log(`         \x1b[31mError: ${res.error}\x1b[0m`);
    }
  }

  console.log(`\nTiempo Total: \x1b[33m${(totalDuration / 1000).toFixed(2)}s\x1b[0m`);

  // Generar reporte consolidado en Markdown
  const markdownReport = `# Informe de Ejecución: Pruebas con Stagehand e Inteligencia Artificial

**Módulo**: Créditos y Préstamos (\`FuBanking\`)  
**Fecha de Ejecución**: ${new Date().toLocaleString('es-CO')}  
**Estrategia LLM**: Model Routing en Google AI Studio (\`gemini-3.5-flash-lite\`, \`gemini-3.5-flash\`, \`gemini-3.8-flash\`)  
**Modo de Visualización**: Navegador interactivo (\`headless: false\`)

---

## Resultados por Escenario

| # | Escenario | Capacidades | Estado | Duración |
|---|---|---|---|---|
| 1 | Simulador de Créditos | \`act\` + \`extract\` | ${overallResults[0]?.status === 'PASSED' ? '✅ APROBADO' : '❌ FALLIDO'} | ${(overallResults[0]?.durationMs / 1000).toFixed(2)}s |
| 2 | Requisitos Normativos | \`observe\` | ${overallResults[1]?.status === 'PASSED' ? '✅ APROBADO' : '❌ FALLIDO'} | ${(overallResults[1]?.durationMs / 1000).toFixed(2)}s |
| 3 | Auditoría y Aprobación Admin | \`act\` + \`observe\` + \`extract\` | ${overallResults[2]?.status === 'PASSED' ? '✅ APROBADO' : '❌ FALLIDO'} | ${(overallResults[2]?.durationMs / 1000).toFixed(2)}s |

---

## Evidencias Visuales Generadas

* \`01-simulador-inicio.png\`: Estado inicial de la pantalla de simulación.
* \`01-simulador-calculado.png\`: Simulación ejecutada por la IA tras ingresar monto y cuotas.
* \`02-requisitos-vista.png\`: Detección visual de requisitos de elegibilidad.
* \`02-requisitos-observados.png\`: Registro de elementos observados en el DOM.
* \`03-admin-bandeja-inicial.png\`: Vista de consola de auditoría de solicitudes.
* \`03-admin-filtrado-pendientes.png\`: Aplicación del filtro 'Pendientes' por acción natural.
* \`03-admin-actualizado.png\`: Refresco de la bandeja tras auditoría.

---

## Estrategia de Model Routing Aplicada

\`\`\`txt
[Model Routing] Act (clicks, digitación)  --> gemini-3.5-flash-lite (Latencia mínima)
[Model Routing] Observe (visión semántica) --> gemini-3.5-flash      (Razonamiento DOM)
[Model Routing] Extract (esquemas Zod)     --> gemini-3.8-flash      (Extracción estructurada estricta)
\`\`\`
`;

  const cwd = process.cwd();
  const evidenceDir = cwd.endsWith('stagehand') ? join(cwd, 'evidence') : join(cwd, 'e2e/stagehand/evidence');
  const reportFile = join(evidenceDir, 'EVIDENCIA_STAGEHAND.md');
  await writeFile(reportFile, markdownReport, 'utf8');
  console.log(`\n📄 Reporte de evidencias Markdown generado en: \x1b[36m${reportFile}\x1b[0m\n`);

  const hasFailed = overallResults.some(r => r.status === 'FAILED');
  if (hasFailed) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error fatal al ejecutar suite de Stagehand:', err);
  process.exit(1);
});
