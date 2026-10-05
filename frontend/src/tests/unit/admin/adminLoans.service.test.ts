import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '@/shared/services/api.client';
import { adminLoansService } from '@/features/admin/services/adminLoans.service';

vi.mock('@/shared/services/api.client', () => ({
  apiClient: { post: vi.fn(), get: vi.fn(), patch: vi.fn() },
}));

const get = apiClient.get as unknown as ReturnType<typeof vi.fn>;
const patch = apiClient.patch as unknown as ReturnType<typeof vi.fn>;

describe('adminLoansService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllLoans', () => {
    it('should GET /loans/admin and return the list', async () => {
      // Arrange
      const loans = [{ id: 'loan-1', status: 'PENDING' }];
      get.mockResolvedValue({ data: loans });

      // Act
      const result = await adminLoansService.getAllLoans();

      // Assert
      expect(get).toHaveBeenCalledWith('/loans/admin');
      expect(result).toEqual(loans);
    });

    it('should propagate errors', async () => {
      // Arrange
      get.mockRejectedValue({ code: 'FORBIDDEN', message: 'Sin permiso' });

      // Act + Assert
      await expect(adminLoansService.getAllLoans()).rejects.toEqual({
        code: 'FORBIDDEN',
        message: 'Sin permiso',
      });
    });
  });

  describe('approveLoan', () => {
    it('should PATCH /loans/admin/:id/approve and return the loan', async () => {
      // Arrange
      const loan = { id: 'loan-1', status: 'APPROVED' };
      patch.mockResolvedValue({ data: loan });

      // Act
      const result = await adminLoansService.approveLoan('loan-1');

      // Assert
      expect(patch).toHaveBeenCalledWith('/loans/admin/loan-1/approve');
      expect(result).toEqual(loan);
    });
  });

  describe('rejectLoan', () => {
    it('should PATCH /loans/admin/:id/reject and return the loan', async () => {
      // Arrange
      const loan = { id: 'loan-1', status: 'REJECTED' };
      patch.mockResolvedValue({ data: loan });

      // Act
      const result = await adminLoansService.rejectLoan('loan-1');

      // Assert
      expect(patch).toHaveBeenCalledWith('/loans/admin/loan-1/reject');
      expect(result).toEqual(loan);
    });
  });
});
