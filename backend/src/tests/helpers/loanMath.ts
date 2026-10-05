/**
 * Cuota del sistema francés (referencia independiente para tests).
 * Misma convención que el dominio: annualRate en porcentaje (24 = 24%).
 */
export function expectedFrenchPayment(amount: number, annualRate: number, installments: number): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return amount / installments;
  return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -installments));
}
