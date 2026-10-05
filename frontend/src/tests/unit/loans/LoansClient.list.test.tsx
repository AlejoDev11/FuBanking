import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LoansClient } from '@/features/loans/components/LoansClient';
import { loanService } from '@/features/loans/services/loan.service';
import { profileService } from '@/features/profile/services/profile.service';
import { eligibleProfile } from './loansClient.fixtures';

vi.mock('@/features/loans/services/loan.service', () => ({
  loanService: { simulate: vi.fn(), create: vi.fn(), getMyLoans: vi.fn() },
}));

vi.mock('@/features/profile/services/profile.service', () => ({
  profileService: { getProfile: vi.fn() },
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const getMyLoans = loanService.getMyLoans as unknown as ReturnType<typeof vi.fn>;
const getProfile = profileService.getProfile as unknown as ReturnType<typeof vi.fn>;

function loanRow(id: string, status: string) {
  return {
    id, amount: 1_000_000, installments: 6, annualRate: 10,
    monthlyPayment: 170_000, totalToPay: 1_020_000, totalInterest: 20_000,
    status, createdAt: '2026-08-01T00:00:00.000Z',
  };
}

describe('LoansClient (listado)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMyLoans.mockResolvedValue([]);
    getProfile.mockResolvedValue(eligibleProfile());
  });

  it('should render approved, rejected and unknown statuses with fallback', async () => {
    getMyLoans.mockResolvedValue([
      loanRow('a', 'APPROVED'),
      loanRow('r', 'REJECTED'),
      { ...loanRow('x', 'WEIRD'), amount: 3_000_000, monthlyPayment: 510_000, totalToPay: 3_060_000, totalInterest: 60_000 },
    ]);
    render(<LoansClient />);

    await waitFor(() => expect(screen.getByText('Aprobado')).toBeInTheDocument());
    expect(screen.getByText('Rechazado')).toBeInTheDocument();
    expect(screen.getByText('WEIRD')).toBeInTheDocument();
  });

  it('should handle birthdays later this year and this month', async () => {
    const t = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const laterThisYear = fmt(new Date(t.getFullYear() - 20, t.getMonth() + 1, 15));
    getProfile.mockResolvedValue(eligibleProfile({ birthDate: laterThisYear }));
    const { unmount } = render(<LoansClient />);
    await waitFor(() => expect(getProfile).toHaveBeenCalled());
    expect(screen.getByText('Solicitar').closest('button')).not.toBeDisabled();
    unmount();

    const sameMonth = new Date(t.getFullYear() - 20, t.getMonth(), Math.min(t.getDate() + 1, 28));
    getProfile.mockResolvedValue(eligibleProfile({ birthDate: fmt(sameMonth) }));
    render(<LoansClient />);
    await waitFor(() => expect(getProfile).toHaveBeenCalledTimes(2));
  });

  it('should keep fetching loans silent on error', async () => {
    getMyLoans.mockRejectedValueOnce(new Error('down'));
    render(<LoansClient />);

    await waitFor(() => expect(getMyLoans).toHaveBeenCalled());
    expect(screen.queryByText('Mis solicitudes')).not.toBeInTheDocument();
  });

  it('should keep profile silent on error', async () => {
    getProfile.mockRejectedValueOnce(new Error('down'));
    render(<LoansClient />);

    await waitFor(() => expect(getProfile).toHaveBeenCalled());
    expect(screen.getByText('Solicitar').closest('button')).toBeDisabled();
  });
});
