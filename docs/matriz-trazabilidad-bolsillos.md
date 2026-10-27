# Matriz de trazabilidad — Bolsillos y Depositar

**Responsable:** Alejandro Bustamante · **Fecha de ejecución:** 2026-10-26  
**Libro completo:** [`_archive/matriz-trazabilidad-bolsillos.xlsx`](_archive/matriz-trazabilidad-bolsillos.xlsx) (hojas *Leyenda*, *Matriz de Trazabilidad*, *Cobertura por Requisito* y *Defectos*).

Cada fila de la matriz relaciona **requisito → funcionalidad → escenario → caso de prueba → herramienta → resultado esperado → resultado obtenido → estado → evidencia → defecto**. Las filas salen de los reportes reales de ejecución (Cypress, Serenity/JS, Newman, Vitest) y de los casos TC-101…152 del Excel de casos; la cobertura del libro se calcula con `COUNTIFS`, así que se recalcula si cambia un estado.

## Cobertura por requisito

| Requisito | Funcionalidad | Cypress + Gherkin | Manual + Katalon | Postman + Newman | Serenity/JS Screenplay + Gherkin | Vitest · performance | Vitest · regresión + unitarias | Vitest · seguridad | Total | Aprobados | % | Defectos |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| HU-23 | Crear bolsillo | 7 | 11 | 7 | 7 | 0 | 2 | 0 | 34 | 34 | 100 % | 1 |
| HU-24 | Consultar bolsillos | 6 | 7 | 2 | 4 | 0 | 1 | 0 | 20 | 20 | 100 % | 1 |
| HU-24 | Editar bolsillo | 5 | 9 | 3 | 5 | 0 | 2 | 0 | 24 | 24 | 100 % | 0 |
| HU-25 | Eliminar bolsillo | 4 | 6 | 2 | 3 | 0 | 2 | 0 | 17 | 17 | 100 % | 0 |
| HU-26 | Transferir entre bolsillos | 5 | 8 | 3 | 5 | 0 | 2 | 0 | 23 | 23 | 100 % | 0 |
| EXTRA | Depositar dinero | 13 | 11 | 7 | 12 | 0 | 2 | 0 | 45 | 45 | 100 % | 0 |
| — | Transversal (entidades, validadores, seguridad) | 0 | 0 | 0 | 0 | 2 | 9 | 5 | 16 | 16 | 100 % | 0 |
| | **Total** | **40** | **52** | **24** | **36** | **2** | **20** | **5** | **179** | **179** | **100 %** | **2** |

Las filas de Vitest son por archivo de prueba (cada una agrupa varias pruebas); el resto son casos o escenarios individuales.

## Defectos y su trazabilidad

| ID | Descripción | Requisito | Detectado por | Estado | Corrección |
|---|---|---|---|---|---|
| DEF-001 (D-01/D-03) | Bolsillo con nombre de solo espacios (el saldo ya se había descontado) | HU-23 | TC-110 (Katalon), RG-CR-D03 | Corregido | R-07 · `b366dbf` |
| DEF-002 | Consulta con varios bolsillos marcada Fallido en la matriz original | HU-24 | TC-113 | No reproducido | Re-prueba 2026-08-24 y Gherkin aprobados |
| D-02 / SEC-03 | Crear bolsillo con `true` como monto | HU-23 | RG-CR-D02, seguridad | Corregido | R-06 · `cabb874` |
| D-08 / SEC-04 | Depositar `true` deposita $1 | EXTRA | RG-DE-D08, @seguridad | Corregido | R-06 · `cabb874` |
| SEC-01 / SEC-02 | Token de 2FA temporal y de reset aceptados como acceso | Transversal | Suite de seguridad | Corregido | R-05 · `cabb874` |
| E2E-01 | Sin "Recordarme" la API no enviaba el token | Transversal | Serenity @web | Corregido (equipo) | R-09 · `365171d` |
| UI-01 | Hydration mismatch del tema borraba lo escrito en el login | Transversal | Katalon | Corregido | R-08 · `8ff70c1` |
| A11Y-01…06 | Contraste, botones sin nombre, nombre accesible y textos invisibles en tema claro | HU-23…26, EXTRA | Cypress `accesibilidad.feature` (axe) | Corregido | R-10 · esta entrega |
| BUILD-01 | El backend no compilaba (`ws` sin tipos): rompía Docker y Jenkins | Transversal | Build de la imagen | Corregido | R-11 · esta entrega |
| D-04 | `amount` como texto: se acepta al crear y se rechaza al actualizar | HU-24 | RG-AC-D04 | Abierto | `it.fails`; recomendado `strictAmount` |
| D-05 | Al crear un bolsillo lo apartado se cuenta dos veces | HU-23 | RG-CR-D05 | Abierto | `it.fails` |
| D-07 | Tabla `pockets` ausente: bolsillos en un `Map` en memoria | HU-23…26 | Revisión de código; confirmado por Keploy | Abierto | Migración recomendada |
| SEC-05…08 | Sin tope de monto, JSON malformado y cuerpos grandes → 500, sin rate limiting | Transversal | Seguridad (endurecimiento) | Abierto | `it.fails` |

Detalle del antes y después de cada corrección: [`refactorizacion-bolsillos-antes-despues.md`](refactorizacion-bolsillos-antes-despues.md).

> **Pendientes de agregar a la matriz:** los escenarios de Stagehand (falta una API key de Anthropic válida) y los tests que generen los Playwright Test Agents. El libro se regenera con los reportes de esas corridas.
