import express, { Application, Request, Response, Router } from 'express';
import { CreatePocket } from '../../application/use-cases/pocket/CreatePocket';
import { GetAccountPockets } from '../../application/use-cases/pocket/GetAccountPockets';
import { UpdatePocket } from '../../application/use-cases/pocket/UpdatePocket';
import { DeletePocket } from '../../application/use-cases/pocket/DeletePocket';
import { TransferPocketBalance } from '../../application/use-cases/pocket/TransferPocketBalance';
import { CreateAccount } from '../../application/use-cases/account/CreateAccount';
import { GetUserAccounts } from '../../application/use-cases/account/GetUserAccounts';
import { GetAccountDetails } from '../../application/use-cases/account/GetAccountDetails';
import { DepositMoney } from '../../application/use-cases/account/DepositMoney';
import { WithdrawMoney } from '../../application/use-cases/account/WithdrawMoney';
import { CloseAccount } from '../../application/use-cases/account/CloseAccount';
import { PocketController } from '../../presentation/controllers/PocketController';
import { AccountController } from '../../presentation/controllers/AccountController';
import { authMiddleware } from '../../presentation/middlewares/authMiddleware';
import { errorHandler } from '../../presentation/middlewares/errorHandler';
import { JwtTokenService } from '../../infrastructure/services/JwtTokenService';
import { InMemoryAccountRepository } from '../fakes/InMemoryAccountRepository';
import { InMemoryPocketRepository } from '../fakes/InMemoryPocketRepository';
import { InMemoryNotificationRepository } from '../fakes/InMemoryNotificationRepository';

export interface PocketTestDeps {
  accountRepository: InMemoryAccountRepository;
  pocketRepository: InMemoryPocketRepository;
  notificationRepository: InMemoryNotificationRepository;
}

export interface PocketTestApp {
  app: Application;
  deps: PocketTestDeps;
  /** Header Authorization con un JWT real firmado para el usuario dado. */
  bearerFor(userId: string): string;
}

/**
 * App Express del módulo Bolsillos para pruebas de API (mismo patrón que
 * createTestApp). Todo es real — authMiddleware, validadores, PocketController,
 * casos de uso y errorHandler — salvo la persistencia, que va en memoria.
 */
export function createPocketTestApp(): PocketTestApp {
  const accountRepository = new InMemoryAccountRepository();
  const pocketRepository = new InMemoryPocketRepository();
  const notificationRepository = new InMemoryNotificationRepository();
  const deps: PocketTestDeps = { accountRepository, pocketRepository, notificationRepository };

  const controller = new PocketController(
    new CreatePocket(accountRepository, pocketRepository, notificationRepository),
    new GetAccountPockets(accountRepository, pocketRepository),
    new UpdatePocket(accountRepository, pocketRepository, notificationRepository),
    new DeletePocket(accountRepository, pocketRepository, notificationRepository),
    new TransferPocketBalance(accountRepository, pocketRepository, notificationRepository),
  );

  // Mismo cableado que presentation/routes/pocket.routes.ts.
  const pocketRouter = Router();
  pocketRouter.post('/', authMiddleware, controller.create);
  pocketRouter.get('/account/:accountId', authMiddleware, controller.listByAccount);
  pocketRouter.patch('/:pocketId', authMiddleware, controller.update);
  pocketRouter.delete('/:pocketId', authMiddleware, controller.remove);
  pocketRouter.post('/transfer', authMiddleware, controller.transfer);

  // Funcionalidad 6 — depósito (módulo Cuentas). Comparte los repositorios con
  // Bolsillos para probar el flujo "depositar → apartar en un bolsillo".
  // Mismo cableado que presentation/routes/account.routes.ts.
  const accountController = new AccountController(
    new CreateAccount(accountRepository),
    new GetUserAccounts(accountRepository),
    new GetAccountDetails(accountRepository),
    new DepositMoney(accountRepository, notificationRepository),
    new WithdrawMoney(accountRepository, notificationRepository),
    new CloseAccount(accountRepository),
  );
  const accountRouter = Router();
  accountRouter.post('/:id/deposit', authMiddleware, accountController.deposit);

  const app = express();
  app.use(express.json());
  app.use('/api/v1/pockets', pocketRouter);
  app.use('/api/v1/accounts', accountRouter);
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' } });
  });
  app.use(errorHandler);

  const tokenService = new JwtTokenService();
  const bearerFor = (userId: string): string =>
    `Bearer ${tokenService.generate({ userId, email: `${userId}@fubank.test` })}`;

  return { app, deps, bearerFor };
}
