import { Application, Router } from 'express';
import { PocketController } from '../../presentation/controllers/PocketController';
import { CreatePocket } from '../../application/use-cases/pocket/CreatePocket';
import { GetAccountPockets } from '../../application/use-cases/pocket/GetAccountPockets';
import { UpdatePocket } from '../../application/use-cases/pocket/UpdatePocket';
import { DeletePocket } from '../../application/use-cases/pocket/DeletePocket';
import { TransferPocketBalance } from '../../application/use-cases/pocket/TransferPocketBalance';
import { authMiddleware } from '../../presentation/middlewares/authMiddleware';
import { mountTestApi } from './mountTestApi';
import { JwtTokenService } from '../../infrastructure/services/JwtTokenService';
import {
  InMemoryAccountRepo,
  InMemoryNotificationRepo,
  InMemoryUserRepo,
  createTestUser,
} from '../fakes/loan.in-memory-repos';
import { FakePocketRepository } from '../unit/pocket/test-doubles';
import { Account, AccountType } from '../../domain/entities/Account';
import { randomUUID } from 'node:crypto';

export interface PocketTestDeps {
  accountRepo: InMemoryAccountRepo;
  pocketRepo: FakePocketRepository;
  notifRepo: InMemoryNotificationRepo;
  userRepo: InMemoryUserRepo;
  userToken: string;
  userId: string;
  accountId: string;
  otherToken: string;
  otherUserId: string;
  otherAccountId: string;
}

export function createPocketTestApp(): { app: Application; deps: PocketTestDeps } {
  const user = createTestUser({ email: 'pocket.user@test.com', document: '1111111111' });
  const otherUser = createTestUser({ email: 'other.pocket@test.com', document: '2222222222' });

  const account = Account.create({
    id: randomUUID(),
    userId: user.id,
    accountNumber: 'ACC1000000001',
    accountType: AccountType.AHORROS,
  });
  const otherAccount = Account.create({
    id: randomUUID(),
    userId: otherUser.id,
    accountNumber: 'ACC1000000002',
    accountType: AccountType.AHORROS,
  });

  const accountRepo = new InMemoryAccountRepo();
  accountRepo.save(account);
  accountRepo.save(otherAccount);
  accountRepo.updateBalance(account.id, 1_000_000);
  accountRepo.updateBalance(otherAccount.id, 1_000_000);

  const pocketRepo = new FakePocketRepository();
  const notifRepo = new InMemoryNotificationRepo();
  const userRepo = new InMemoryUserRepo([user, otherUser]);

  const controller = new PocketController(
    new CreatePocket(accountRepo, pocketRepo, notifRepo),
    new GetAccountPockets(accountRepo, pocketRepo),
    new UpdatePocket(accountRepo, pocketRepo, notifRepo),
    new DeletePocket(accountRepo, pocketRepo, notifRepo),
    new TransferPocketBalance(accountRepo, pocketRepo, notifRepo),
  );

  const router = Router();
  router.post('/', authMiddleware, controller.create);
  router.get('/account/:accountId', authMiddleware, controller.listByAccount);
  router.patch('/:pocketId', authMiddleware, controller.update);
  router.delete('/:pocketId', authMiddleware, controller.remove);
  router.post('/transfer', authMiddleware, controller.transfer);

  const app = mountTestApi(router, '/api/v1/pockets');
  const tokens = new JwtTokenService();

  return {
    app,
    deps: {
      accountRepo,
      pocketRepo,
      notifRepo,
      userRepo,
      userToken: tokens.generate({ userId: user.id, email: user.email.toString() }),
      userId: user.id,
      accountId: account.id,
      otherToken: tokens.generate({ userId: otherUser.id, email: otherUser.email.toString() }),
      otherUserId: otherUser.id,
      otherAccountId: otherAccount.id,
    },
  };
}
