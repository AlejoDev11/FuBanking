/**
 * FuBanking MCP server (solo lectura).
 *
 * Expone la API REST /api/v1 como tools para asistentes IA.
 * Transporte: stdio (Claude Desktop, VS Code, etc.).
 * Auth: JWT del usuario vía env FUBANKING_JWT (Bearer).
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_URL = process.env['FUBANKING_API_URL'] ?? 'http://localhost:3001/api/v1';
const JWT = process.env['FUBANKING_JWT'] ?? '';

async function api<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(JWT ? { Authorization: `Bearer ${JWT}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const json = (await res.json()) as { success: boolean; message: string; data: T };
  if (!res.ok || !json.success) {
    throw new Error(json.message || `HTTP ${res.status} en ${method} ${path}`);
  }
  return json.data;
}

const text = (value: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
});

const server = new McpServer({ name: 'fubanking', version: '1.0.0' });

server.registerTool(
  'get_accounts',
  { description: 'Lista las cuentas del usuario autenticado (saldo, número, estado).', inputSchema: {} },
  async () => text(await api('GET', '/accounts/me')),
);

server.registerTool(
  'get_account_detail',
  {
    description: 'Detalle de una cuenta por id.',
    inputSchema: { accountId: z.string().describe('ID de la cuenta') },
  },
  async ({ accountId }) => text(await api('GET', `/accounts/${accountId}`)),
);

server.registerTool(
  'get_history',
  {
    description: 'Historial de movimientos de una cuenta (fecha, tipo, monto, estado, saldo resultante si el backend lo devuelve).',
    inputSchema: { accountId: z.string().describe('ID de la cuenta') },
  },
  async ({ accountId }) => text(await api('GET', `/transfers/account/${accountId}`)),
);

server.registerTool(
  'get_pockets',
  {
    description: 'Bolsillos (cajitas) de una cuenta.',
    inputSchema: { accountId: z.string().describe('ID de la cuenta') },
  },
  async ({ accountId }) => text(await api('GET', `/pockets/account/${accountId}`)),
);

server.registerTool(
  'get_notifications',
  { description: 'Notificaciones del usuario autenticado.', inputSchema: {} },
  async () => text(await api('GET', '/notifications/me')),
);

server.registerTool(
  'get_loans',
  { description: 'Créditos del usuario autenticado.', inputSchema: {} },
  async () => text(await api('GET', '/loans/me')),
);

server.registerTool(
  'simulate_loan',
  {
    description: 'Simula un crédito (no crea nada, solo calcula la cuota mensual).',
    inputSchema: {
      amount: z.number().positive().describe('Monto solicitado'),
      installments: z.number().int().positive().describe('Número de cuotas'),
      annualRate: z.number().positive().describe('Tasa anual (ej. 0.24 para 24%)'),
    },
  },
  async ({ amount, installments, annualRate }) =>
    text(await api('POST', '/loans/simulate', { amount, installments, annualRate })),
);

await server.connect(new StdioServerTransport());
