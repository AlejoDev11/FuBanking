# Matriz de trazabilidad — FuBanking (todo el equipo)

**Corte:** 2026-10-26 · **Libro completo:** [`_archive/matriz-trazabilidad-equipo.xlsx`](_archive/matriz-trazabilidad-equipo.xlsx) (hojas *Leyenda*, *Matriz Equipo*, *Cobertura*, *Resumen por Integrante* y *Defectos*).

Cada fila relaciona **integrante → módulo → requisito → escenario → caso → herramienta → resultado esperado → resultado obtenido → estado → evidencia → defecto**. Los estados distinguen:

- **Aprobado / Fallido:** ejecutado el 2026-10-26 o con evidencia de ejecución en el repositorio.
- **Aprobado (reportado):** resultado documentado por el responsable y no re-ejecutado hoy (Stagehand y herramientas de IA de Créditos).
- **No ejecutado:** existe solo en `upstream/dev` y depende de código que no está en esta rama (Cypress de Usuarios y Retiro).
- **Sin resultado registrado:** caso diseñado en el Excel o suite de Katalon sin estado ni evidencia.

## Resumen por integrante

| Integrante | Filas | Aprobados | Aprobados (reportados) | Fallidos | Sin ejecutar / sin resultado |
|---|---:|---:|---:|---:|---:|
| Tomás Henao | 225 | 100 | 0 | 0 | 125 |
| Andrés Bedoya | 85 | 49 | 7 | 0 | 29 |
| Alejandro Bustamante | 232 | 231 | 0 | 0 | 1 |
| Equipo | 66 | 66 | 0 | 0 | 0 |
| **Total** | **608** | **446** | **7** | **0** | **155** |

## Cobertura por requisito

| Integrante | Módulo | Requisito | Filas | Aprobados | Reportados | Fallidos | Herramientas |
|---|---|---|---:|---:|---:|---:|---|
| Tomás Henao | Usuarios | RF-01 Registro de usuario | 40 | 11 | 0 | 0 | Casos del Excel (diseño + ejecución manual), Cypress (Usuarios y Retiro, upstream/dev), Katalon Recorder, Serenity/JS Screenplay + Gherkin, Vitest backend, Vitest frontend |
| Tomás Henao | Usuarios | RF-04 Autenticación de usuario | 50 | 28 | 0 | 0 | Casos del Excel (diseño + ejecución manual), Cypress (Usuarios y Retiro, upstream/dev), Katalon Recorder, Serenity/JS Screenplay + Gherkin, Vitest backend, Vitest frontend |
| Tomás Henao | Usuarios | RF-09 Restablecimiento seguro de contraseña | 45 | 19 | 0 | 0 | Casos del Excel (diseño + ejecución manual), Cypress (Usuarios y Retiro, upstream/dev), Katalon Recorder, Serenity/JS Screenplay + Gherkin, Vitest backend, Vitest frontend |
| Tomás Henao | Usuarios | RF-13 Validación 2FA durante la autenticación | 28 | 11 | 0 | 0 | Casos del Excel (diseño + ejecución manual), Cypress (Usuarios y Retiro, upstream/dev), Katalon Recorder, Vitest backend, Vitest frontend |
| Tomás Henao | Usuarios | RF-16 Actualización del perfil | 50 | 24 | 0 | 0 | Casos del Excel (diseño + ejecución manual), Cypress (Usuarios y Retiro, upstream/dev), Katalon Recorder, Serenity/JS Screenplay + Gherkin, Vitest backend, Vitest frontend |
| Tomás Henao | Cuentas | EX-RET Retirar dinero (funcionalidad extra) | 12 | 7 | 0 | 0 | Cypress (Usuarios y Retiro, upstream/dev), Katalon Recorder, Serenity/JS Screenplay + Gherkin, Vitest backend |
| Andrés Bedoya | Créditos | HU-27 Simulación de crédito | 59 | 43 | 5 | 0 | Casos del Excel (diseño + ejecución manual), Cypress (Créditos, mocks), IA · Cypress Cloud + cy.prompt (Andrés), IA · Playwright MCP (Andrés), IA · ReportPortal (Andrés), Katalon Recorder, Serenity/JS Screenplay + Gherkin, Stagehand (Gemini, Andrés), Vitest backend, Vitest frontend |
| Andrés Bedoya | Créditos | HU-28 Solicitud de préstamo | 9 | 3 | 1 | 0 | Casos del Excel (diseño + ejecución manual), Serenity/JS Screenplay + Gherkin, Stagehand (Gemini, Andrés), Vitest backend |
| Andrés Bedoya | Créditos | HU-29 Historial de solicitudes | 4 | 0 | 0 | 0 | Casos del Excel (diseño + ejecución manual) |
| Andrés Bedoya | Créditos | HU-31 Aceptar solicitud de préstamo | 8 | 2 | 1 | 0 | Casos del Excel (diseño + ejecución manual), Serenity/JS Screenplay + Gherkin, Stagehand (Gemini, Andrés), Vitest backend |
| Andrés Bedoya | Créditos | HU-32 Rechazar solicitud de préstamo | 5 | 1 | 0 | 0 | Casos del Excel (diseño + ejecución manual), Vitest backend |
| Alejandro Bustamante | Bolsillos | HU-23 Crear bolsillo | 68 | 67 | 0 | 0 | Casos del Excel (diseño + ejecución manual), Cypress + Gherkin (Bolsillos), IA · Keploy (Alejandro), IA · Playwright Test Agents (Alejandro), IA · Postman + Newman (Alejandro), Katalon Recorder, Serenity/JS Screenplay + Gherkin, Stagehand (google/gemini-3.5-flash), Vitest backend, Vitest frontend |
| Alejandro Bustamante | Bolsillos | HU-24 Consultar bolsillos | 27 | 27 | 0 | 0 | Casos del Excel (diseño + ejecución manual), Cypress + Gherkin (Bolsillos), IA · Keploy (Alejandro), IA · Postman + Newman (Alejandro), Katalon Recorder, Serenity/JS Screenplay + Gherkin, Stagehand (google/gemini-3.5-flash), Vitest backend |
| Alejandro Bustamante | Bolsillos | HU-24 Editar bolsillo | 29 | 29 | 0 | 0 | Casos del Excel (diseño + ejecución manual), Cypress + Gherkin (Bolsillos), IA · Keploy (Alejandro), IA · Postman + Newman (Alejandro), Katalon Recorder, Serenity/JS Screenplay + Gherkin, Stagehand (google/gemini-3.5-flash), Vitest backend |
| Alejandro Bustamante | Bolsillos | HU-25 Eliminar bolsillo | 21 | 21 | 0 | 0 | Casos del Excel (diseño + ejecución manual), Cypress + Gherkin (Bolsillos), IA · Keploy (Alejandro), IA · Postman + Newman (Alejandro), Katalon Recorder, Serenity/JS Screenplay + Gherkin, Stagehand (google/gemini-3.5-flash-lite), Vitest backend |
| Alejandro Bustamante | Bolsillos | HU-26 Transferir entre bolsillos | 28 | 28 | 0 | 0 | Casos del Excel (diseño + ejecución manual), Cypress + Gherkin (Bolsillos), IA · Keploy (Alejandro), IA · Postman + Newman (Alejandro), Katalon Recorder, Serenity/JS Screenplay + Gherkin, Stagehand (google/gemini-3.5-flash-lite), Vitest backend |
| Alejandro Bustamante | Cuentas | EX-DEP Depositar dinero (funcionalidad extra) | 59 | 59 | 0 | 0 | Casos del Excel (diseño + ejecución manual), Cypress + Gherkin (Bolsillos), IA · Keploy (Alejandro), IA · Postman + Newman (Alejandro), Katalon Recorder, Serenity/JS Screenplay + Gherkin, Stagehand (google/gemini-3.5-flash-lite), Vitest backend, Vitest frontend |
| Equipo | Otros | OTROS Otros módulos (tarjetas, transferencias, solicitudes, notificaciones, pagos, cuentas, UX) | 66 | 66 | 0 | 0 | IA · Keploy (Alejandro), Vitest backend, Vitest frontend |

## Filas por herramienta

| Herramienta / suite | Filas |
|---|---:|
| Casos del Excel (diseño + ejecución manual) | 168 |
| Vitest backend | 116 |
| Serenity/JS Screenplay + Gherkin | 69 |
| Vitest frontend | 65 |
| IA · Keploy (Alejandro) | 50 |
| Cypress + Gherkin (Bolsillos) | 40 |
| Cypress (Usuarios y Retiro, upstream/dev) | 31 |
| IA · Postman + Newman (Alejandro) | 24 |
| Cypress (Créditos, mocks) | 18 |
| Katalon Recorder | 13 |
| Stagehand (Gemini, Andrés) | 3 |
| Stagehand (google/gemini-3.5-flash) | 3 |
| Stagehand (google/gemini-3.5-flash-lite) | 3 |
| IA · Cypress Cloud + cy.prompt (Andrés) | 2 |
| IA · Playwright MCP (Andrés) | 1 |
| IA · Playwright Test Agents (Alejandro) | 1 |
| IA · ReportPortal (Andrés) | 1 |

## Hallazgos que afectan a todo el equipo

- **REG-01 (crítico, abierto):** `upstream/dev` (`c9ce5f4`) cachea cuentas en memoria, agrega cuentas falsas y un *timeout* de 1,2 s en `SupabaseAccountRepository`; la colección de Bolsillos baja de 136/136 a 99/134 y `tsc` no compila. Evidencia: `evidencia-final-bolsillos/regresion-upstream-c9ce5f4.txt`.
- **Endpoints `/auth/test-helper/*`** (usados por el Cypress de Usuarios en dev) exponen códigos 2FA y enlaces de *reset*: deben quedar limitados al entorno de pruebas.
- **Rendimiento:** las pruebas de presupuesto de tiempo de autenticación y tarjetas fallan si la máquina está cargada; se repitieron en una máquina libre (ver hoja *Matriz Equipo*).
