# MCP server FuBanking (solo lectura)

`mcp-server/` expone la API `/api/v1` como tools MCP (transporte stdio) para que un asistente IA consulte el banco en lenguaje natural. Servicio aislado: no toca backend ni frontend.

## Setup

```bash
cd mcp-server && npm i && npm run build
cp .env.example .env   # FUBANKING_API_URL + FUBANKING_JWT (jwt de un usuario)
```

Claude Desktop (`claude_desktop_config.json`):

```json
{ "mcpServers": { "fubanking": {
  "command": "node",
  "args": ["C:/.../FuBanking/mcp-server/dist/index.js"],
  "env": { "FUBANKING_API_URL": "http://localhost:3001/api/v1", "FUBANKING_JWT": "..." }
} } }
```

## Mapa tool / input / output

Todas responden el `data` del wrapper `{success,message,data}` como JSON en texto. Error → texto con `isError: true`.

| Tool | Input | Output |
|---|---|---|
| `get_accounts` | — | `GET /accounts/me` → cuentas (saldo, número, estado) |
| `get_account_detail` | `{ accountId: string }` | `GET /accounts/:id` → detalle + saldo |
| `get_history` | `{ accountId: string }` | `GET /transfers/account/:accountId` → movimientos (fecha, tipo, monto, estado, `resultingBalance` si aplica) |
| `get_pockets` | `{ accountId: string }` | `GET /pockets/account/:accountId` → bolsillos |
| `get_notifications` | — | `GET /notifications/me` → notificaciones |
| `get_loans` | — | `GET /loans/me` → créditos |
| `simulate_loan` | `{ amount: number>0, installments: int>0, annualRate: number>0 }` | `POST /loans/simulate` → cuota mensual (no crea nada) |

## Límites

Solo lectura + simulación. Nada que mueva dinero (`POST /transfers`, `/payments`, depósitos, retiros, responder solicitudes) está expuesto a propósito.
