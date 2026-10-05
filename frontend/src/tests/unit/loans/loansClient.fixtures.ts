import { formatCurrency } from '@/shared/utils/format';

// dom v10 no normaliza el query en matchers string: se reemplaza el NBSP de Intl.
export const cop = (n: number) => formatCurrency(n).split(String.fromCharCode(160)).join(' ');

export function eligibleProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'u@e.co',
    documentVerified: true,
    birthDate: '1990-05-05',
    monthlyIncome: 2_000_000,
    ...overrides,
  };
}

export function pendingLoanRow(id = 'loan-p') {
  return {
    id, amount: 1_000_000, installments: 6, annualRate: 10,
    monthlyPayment: 170_000, totalToPay: 1_020_000, totalInterest: 20_000,
    status: 'PENDING', createdAt: '2026-08-01T00:00:00.000Z',
  };
}
