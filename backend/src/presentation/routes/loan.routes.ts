import { Router } from 'express';
import { LoanController } from '../controllers/LoanController';
import { CreateLoanApplication } from '../../application/use-cases/loan/CreateLoanApplication';
import { SimulateLoan } from '../../application/use-cases/loan/SimulateLoan';
import { GetAllLoans } from '../../application/use-cases/loan/GetAllLoans';
import { GetUserLoans } from '../../application/use-cases/loan/GetUserLoans';
import { ApproveLoan } from '../../application/use-cases/loan/ApproveLoan';
import { RejectLoan } from '../../application/use-cases/loan/RejectLoan';
import { SupabaseLoanApplicationRepository } from '../../infrastructure/repositories/SupabaseLoanApplicationRepository';
import { SupabaseUserRepository } from '../../infrastructure/repositories/SupabaseUserRepository';
import { SupabaseNotificationRepository } from '../../infrastructure/repositories/SupabaseNotificationRepository';
import { SupabaseAccountRepository } from '../../infrastructure/repositories/SupabaseAccountRepository';
import supabaseClient from '../../infrastructure/database/supabase.client';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { createRateLimiter } from '../middlewares/rateLimitMiddleware';

const router = Router();

const loanRepo = new SupabaseLoanApplicationRepository(supabaseClient);
const userRepo = new SupabaseUserRepository(supabaseClient);
const notificationRepo = new SupabaseNotificationRepository(supabaseClient);
const accountRepo = new SupabaseAccountRepository(supabaseClient);

const simulateLoan = new SimulateLoan();
const createLoanApplication = new CreateLoanApplication(loanRepo, userRepo, notificationRepo);
const getAllLoans = new GetAllLoans(loanRepo);
const getUserLoans = new GetUserLoans(loanRepo);
const approveLoan = new ApproveLoan(loanRepo, accountRepo, notificationRepo);
const rejectLoan = new RejectLoan(loanRepo, notificationRepo);

const controller = new LoanController(
  createLoanApplication,
  simulateLoan,
  getAllLoans,
  getUserLoans,
  approveLoan,
  rejectLoan,
);

// Anti-abuso: la simulación es barata pero pública para autenticados;
// la creación toca DB + notificaciones. Clave por usuario (con fallback a IP).
const byUserOrIp = (prefix: string) => (req: { user?: { id: string }; ip?: string }) => {
  const who = req.user?.id ?? `ip:${req.ip ?? 'unknown'}`;
  return `${prefix}:${who}`;
};
export const simulateLimiter = createRateLimiter({ maxRequests: 30, windowMs: 60_000, keyExtractor: byUserOrIp('loan-simulate') });
export const createLoanLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000, keyExtractor: byUserOrIp('loan-create') });

router.post('/simulate', authMiddleware, simulateLimiter, controller.simulate);
router.post('/', authMiddleware, createLoanLimiter, controller.create);
router.get('/me', authMiddleware, controller.getMyLoans);

router.get('/admin', authMiddleware, adminMiddleware, controller.getAll);
router.patch('/admin/:id/approve', authMiddleware, adminMiddleware, controller.approve);
router.patch('/admin/:id/reject', authMiddleware, adminMiddleware, controller.reject);

export default router;
