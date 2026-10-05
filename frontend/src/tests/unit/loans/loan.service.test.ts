import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '@/shared/services/api.client';
import { loanService } from '@/features/loans/services/loan.service';

vi.mock('@/shared/services/api.client', () => ({
  apiClient: { post: vi.fn(), get: vi.fn(), patch: vi.fn() },
}));

const post = apiClient.post as unknown as ReturnType<typeof vi.fn>;
const get = apiClient.get as unknown as ReturnType<typeof vi.fn>;

describe('loanService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('simulate / simulateLoan', () => {
    it('should POST /loans/simulate and return data (both aliases)', async () => {
      // Arrange
      const payload = { amount: 5_000_000, installments: 12, annualRate: 24 };
      const simulation = { ...payload, monthlyRate: 0.02, monthlyPayment: 470_000, totalToPay: 5_640_000, totalInterest: 640_000 };
      post.mockResolvedValue({ data: simulation });

      // Act
      const viaSimulate = await loanService.simulate(payload);
      const viaAlias = await loanService.simulateLoan(payload);

      // Assert
      expect(post).toHaveBeenCalledWith('/loans/simulate', payload);
      expect(viaSimulate).toEqual(simulation);
      expect(viaAlias).toEqual(simulation);
    });

    it('should propagate errors', async () => {
      // Arrange
      post.mockRejectedValue({ code: 'VALIDATION_ERROR', message: 'Monto inválido' });

      // Act + Assert
      await expect(
        loanService.simulate({ amount: -1, installments: 12, annualRate: 24 }),
      ).rejects.toEqual({ code: 'VALIDATION_ERROR', message: 'Monto inválido' });
    });
  });

  describe('create / createLoan', () => {
    it('should POST /loans and return the application (both aliases)', async () => {
      // Arrange
      const payload = { amount: 5_000_000, installments: 12, annualRate: 24, monthlyIncome: 1_800_000 };
      const application = { ...payload, id: 'loan-1', userId: 'user-1', status: 'PENDING' };
      post.mockResolvedValue({ data: application });

      // Act
      const viaCreate = await loanService.create(payload);
      const viaAlias = await loanService.createLoan(payload);

      // Assert
      expect(post).toHaveBeenCalledWith('/loans', payload);
      expect(viaCreate).toEqual(application);
      expect(viaAlias).toEqual(application);
    });
  });

  describe('getMyLoans', () => {
    it('should GET /loans/me and return the list', async () => {
      // Arrange
      const loans = [{ id: 'loan-1' }, { id: 'loan-2' }];
      get.mockResolvedValue({ data: loans });

      // Act
      const result = await loanService.getMyLoans();

      // Assert
      expect(get).toHaveBeenCalledWith('/loans/me');
      expect(result).toEqual(loans);
    });
  });
});
