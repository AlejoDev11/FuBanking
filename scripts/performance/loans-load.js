/**
 * FuBanking — Carga concurrente del módulo créditos (k6).
 *
 * Requiere: backend vivo en http://localhost:3001 + k6 instalado.
 * Usar: k6 run scripts/performance/loans-load.js
 * Solo lectura + simulación (no crea préstamos, no ensucia la BD).
 */
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.FUBANKING_API_URL || 'http://localhost:3001/api/v1';
const TOKEN = __ENV.FUBANKING_JWT || '';

export function setup() {
  if (!TOKEN) {
    throw new Error('FUBANKING_JWT requerido: exporta un JWT válido antes de correr k6');
  }
}

export default function () {
  const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };
  let res = http.post(
    `${BASE}/loans/simulate`,
    JSON.stringify({ amount: 5000000, installments: 24, annualRate: 0.24 }),
    { headers },
  );
  check(res, { 'simulate 200': (r) => r.status === 200 });
  res = http.get(`${BASE}/loans/me`, { headers });
  check(res, { 'me 200': (r) => r.status === 200 });
}
