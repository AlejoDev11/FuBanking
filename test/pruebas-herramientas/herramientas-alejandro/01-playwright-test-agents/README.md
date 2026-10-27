# Playwright Test Agents — Bolsillos y Depositar

Playwright (≥ 1.56) trae tres **agentes de IA** que trabajan en cadena sobre la aplicación real:

| Agente | Entrada | Salida | Archivo |
|---|---|---|---|
| 🎭 **planner** | Una petición ("planea pruebas de Crear bolsillo") + el seed | Plan en Markdown con escenarios, pasos y resultados esperados | `specs/*.md` |
| 🎭 **generator** | Un plan de `specs/` | Test de Playwright verificado en vivo (localizadores y aserciones reales) | `tests/*.spec.ts` |
| 🎭 **healer** | Un test que falla | El test reparado, o marcado `test.fixme` si el fallo es del producto | `tests/*.spec.ts` |

Los agentes no tienen modelo propio: corren dentro de un **bucle agéntico** (aquí, Claude Code con
`--loop=claude`) y controlan el navegador con el servidor MCP de pruebas de Playwright
(`playwright run-test-mcp-server`).

## Configuración en este repo

| Archivo | Para qué |
|---|---|
| `.claude/agents/playwright-test-{planner,generator,healer}.md` | Definición de los 3 agentes (generada con `npx playwright init-agents --loop=claude`). |
| `.mcp.json` (raíz) | Servidor MCP `playwright-test` apuntando a `playwright.config.ts` de esta carpeta. |
| `playwright.config.ts` | Proyecto Chromium, reporte HTML/JSON en `evidence/`, capturas siempre. |
| `tests/fixtures.ts` | Cada test arranca con una clienta **nueva** (saldo 500.000) creada por la API real y con sesión abierta en `/pockets`. Expone `client.api` como oráculo (saldo y bolsillos). |
| `tests/seed.spec.ts` | Seed: el punto de partida del planner y del generator. |

Para regenerar los agentes (por ejemplo, al actualizar Playwright):

```bash
npx playwright init-agents --loop=claude -c test/pruebas-herramientas/herramientas-alejandro/01-playwright-test-agents/playwright.config.ts
```

## Cómo se ejecutan los agentes

1. Levantar backend (:3001) y frontend (:3000).
2. Abrir **una sesión nueva** de Claude Code en la raíz del repo: los servidores MCP y los agentes se cargan
   al iniciar la sesión. Aprobar el servidor `playwright-test` cuando lo pida.
3. Pedir, en orden:
   - *"Usa el agente playwright-test-planner para planear las pruebas de Crear, Consultar, Editar, Eliminar
     y Transferir bolsillos y de Depositar (pantalla /accounts). Guarda un plan por funcionalidad en
     `test/pruebas-herramientas/herramientas-alejandro/01-playwright-test-agents/specs/`."*
   - *"Usa el agente playwright-test-generator para generar los tests de cada plan."*
   - *"Usa el agente playwright-test-healer para reparar los tests que fallen."*
4. Correr la suite generada (sin IA, determinista; sirve también como regresión):

```bash
npm run test:pw-agents:bolsillos
```

## Evidencias

- `specs/*.md`: planes del planner (objetivo, pasos, resultado esperado).
- `tests/*.spec.ts`: tests del generator (cada uno referencia su plan y el seed).
- `evidence/html-report/`, `evidence/results.json`: resultado de la corrida.
- Capturas de la sesión de Claude Code con las llamadas de cada agente (planner → generator → healer).

## Estado

⏳ **Pendiente de ejecución.** Seed y fixtures listos (`--list` encuentra el seed). Los planes y tests
generados se agregan cuando Supabase esté disponible: el registro de clientes de prueba depende de él.
