import { Application, Router } from 'express';
import { LoanController } from '../../presentation/controllers/LoanController';
import { CreateLoanApplication } from '../../application/use-cases/loan/CreateLoanApplication';
import { SimulateLoan } from '../../application/use-cases/loan/SimulateLoan';
import { GetAllLoans } from '../../application/use-cases/loan/GetAllLoans';
import { GetUserLoans } from '../../application/use-cases/loan/GetUserLoans';
import { ApproveLoan } from '../../application/use-cases/loan/ApproveLoan';
import { RejectLoan } from '../../application/use-cases/loan/RejectLoan';
import { authMiddleware } from '../../presentation/middlewares/authMiddleware';
import { createAdminMiddleware } from '../../presentation/middlewares/adminMiddleware';
import { mountTestApi } from './mountTestApi';
import { JwtTokenService } from '../../infrastructure/services/JwtTokenService';
import {
  InMemoryLoanRepo,
  InMemoryUserRepo,
  InMemoryAccountRepo,
  InMemoryNotificationRepo,
  createTestUser,
} from '../fakes/loan.in-memory-repos';

export interface LoanTestDeps {
  loanRepo: InMemoryLoanRepo;
  userRepo: InMemoryUserRepo;
  accountRepo: InMemoryAccountRepo;
  notifRepo: InMemoryNotificationRepo;
  userToken: string;
  adminToken: string;
  userId: string;
  adminId: string;
}

/**
 * App de pruebas HTTP del módulo créditos con repos en memoria.
 * Réplica fiel de loan.routes.ts (mismos middlewares y controlador),
 * pero con adminMiddleware inyectado con el userRepo fake.
 */
export function createLoanTestApp(): { app: Application; deps: LoanTestDeps } {
  const user = createTestUser({ email: 'loan.user@test.com', document: '1111111111' });
  const admin = createTestUser({
    email: 'loan.admin@test.com',
    document: '9999999999',
    role: 'admin',
  });
  const loanRepo = new InMemoryLoanRepo();
  const userRepo = new InMemoryUserRepo([user, admin]);
  const accountRepo = new InMemoryAccountRepo();
  const notifRepo = new InMemoryNotificationRepo();

  const controller = new LoanController(
    new CreateLoanApplication(loanRepo, userRepo, notifRepo),
    new SimulateLoan(),
    new GetAllLoans(loanRepo),
    new GetUserLoans(loanRepo),
    new ApproveLoan(loanRepo, accountRepo, notifRepo),
    new RejectLoan(loanRepo, notifRepo),
  );

  const adminOnly = createAdminMiddleware(userRepo);
  const loanRouter = Router();
  loanRouter.post('/simulate', authMiddleware, controller.simulate);
  loanRouter.post('/', authMiddleware, controller.create);
  loanRouter.get('/me', authMiddleware, controller.getMyLoans);
  loanRouter.get('/admin', authMiddleware, adminOnly, controller.getAll);
  loanRouter.patch('/admin/:id/approve', authMiddleware, adminOnly, controller.approve);
  loanRouter.patch('/admin/:id/reject', authMiddleware, adminOnly, controller.reject);

  const app: Application = mountTestApi(loanRouter, '/api/v1/loans');

  const tokens = new JwtTokenService();
  return {
    app,
    deps: {
      loanRepo,
      userRepo,
      accountRepo,
      notifRepo,
      userToken: tokens.generate({ userId: user.id, email: 'loan.user@test.com' }),
      adminToken: tokens.generate({ userId: admin.id, email: 'loan.admin@test.com' }),
      userId: user.id,
      adminId: admin.id,
    },
  };
}
