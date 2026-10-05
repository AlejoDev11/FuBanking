import { apiClient } from '@/shared/services/api.client';
import { AdminLoanApplication } from '../types/admin.types';

class AdminLoansService {
  async getAllLoans(): Promise<AdminLoanApplication[]> {
    const response = await apiClient.get<AdminLoanApplication[]>('/loans/admin');
    return response.data;
  }

  async approveLoan(id: string): Promise<AdminLoanApplication> {
    const response = await apiClient.patch<AdminLoanApplication>(`/loans/admin/${id}/approve`);
    return response.data;
  }

  async rejectLoan(id: string): Promise<AdminLoanApplication> {
    const response = await apiClient.patch<AdminLoanApplication>(`/loans/admin/${id}/reject`);
    return response.data;
  }
}

export const adminLoansService = new AdminLoansService();
