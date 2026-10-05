import { describe, it, expect } from 'vitest';
import { SimulateLoan } from '../../application/use-cases/loan/SimulateLoan';
import { expectedFrenchPayment } from '../helpers/loanMath';

/**
 * Performance del cálculo puro de simulación (sin DB ni red).
 * Patrón del ejemplo del profesor: presupuesto explícito + mediana de N repeticiones.
 * Al ser CI-friendly (sin backend vivo), corre en cada regresión.
 */
describe('SimulateLoan performance', () => {
  const input = { amount: 5_000_000, installments: 24, annualRate: 0.24 };

  it('simula dentro del presupuesto educativo (<500ms, mediana de 5)', async () => {
    // Arrange
    const useCase = new SimulateLoan();
    const durations: number[] = [];
    // Act
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      const result = await useCase.execute(input);
      durations.push(performance.now() - start);
      // Assert (correctitud en cada repetición: regresión numérica)
      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.monthlyPayment).toBeCloseTo(expectedFrenchPayment(5_000_000, 0.24, 24), 2);
    }
    durations.sort((a, b) => a - b);
    const median = durations[Math.floor(durations.length / 2)]!;
    // Assert (presupuesto)
    expect(median).toBeLessThan(500);
  });
});
