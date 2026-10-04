import { describe, it, expect } from 'vitest';
import { toLoanResponseDto } from '../../../application/use-cases/loan/loanResponseMapper';
import { buildPendingLoan } from './in-memory-repos';

describe('toLoanResponseDto', () => {
  it('serializa todos los campos públicos del préstamo', async () => {
    // Arrange
    const loan = buildPendingLoan('user-1');
    // Act
    const dto = toLoanResponseDto(loan);
    // Assert
    expect(dto).toMatchObject({
      id: loan.id,
      userId: 'user-1',
      amount: 5_000_000,
      installments: 12,
      annualRate: 24,
      status: 'PENDING',
    });
    expect(dto.monthlyPayment).toBeGreaterThan(0);
    expect(dto.eligibility.isEligible).toBe(true);
  });

  it('no expone internos de la entidad', async () => {
    // Arrange
    const loan = buildPendingLoan('user-1');
    // Act
    const dto = toLoanResponseDto(loan);
    // Assert
    expect(dto).not.toHaveProperty('approve');
    expect(dto).not.toHaveProperty('toPublic');
    expect(Object.keys(dto)).toContain('createdAt');
  });
});
