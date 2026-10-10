import { Application, Router } from 'express';
import { CardController } from '../../presentation/controllers/CardController';
import { CreateVirtualCard } from '../../application/use-cases/card/CreateVirtualCard';
import { GetUserCards } from '../../application/use-cases/card/GetUserCards';
import { ToggleCardLock } from '../../application/use-cases/card/ToggleCardLock';
import { RevealVirtualCardDetails } from '../../application/use-cases/card/RevealVirtualCardDetails';
import { DeleteVirtualCard } from '../../application/use-cases/card/DeleteVirtualCard';
import { authMiddleware } from '../../presentation/middlewares/authMiddleware';
import { mountTestApi } from './mountTestApi';
import { JwtTokenService } from '../../infrastructure/services/JwtTokenService';
import {
  InMemoryAccountRepo,
  InMemoryNotificationRepo,
  InMemoryUserRepo,
  createTestUser,
} from '../fakes/loan.in-memory-repos';
import { InMemoryVirtualCardRepo, createTestAccount } from '../unit/card/in-memory-repos';

export interface CardTestDeps {
  cardRepo: InMemoryVirtualCardRepo;
  accountRepo: InMemoryAccountRepo;
  userRepo: InMemoryUserRepo;
  notifRepo: InMemoryNotificationRepo;
  userToken: string;
  userId: string;
  accountId: string;
  otherToken: string;
  otherUserId: string;
  otherAccountId: string;
}

export function createCardTestApp(): { app: Application; deps: CardTestDeps } {
  const user = createTestUser({ email: 'card.user@test.com', document: '1111111111' });
  const otherUser = createTestUser({ email: 'other.card@test.com', document: '2222222222' });

  const account = createTestAccount(user.id);
  const otherAccount = createTestAccount(otherUser.id);

  const cardRepo = new InMemoryVirtualCardRepo();
  const accountRepo = new InMemoryAccountRepo();
  accountRepo.save(account);
  accountRepo.save(otherAccount);

  const userRepo = new InMemoryUserRepo([user, otherUser]);
  const notifRepo = new InMemoryNotificationRepo();

  const controller = new CardController(
    new CreateVirtualCard(cardRepo, accountRepo, userRepo, notifRepo),
    new GetUserCards(cardRepo),
    new ToggleCardLock(cardRepo, notifRepo),
    new RevealVirtualCardDetails(cardRepo),
    new DeleteVirtualCard(cardRepo, notifRepo),
  );

  const router = Router();
  router.post('/', authMiddleware, controller.create);
  router.get('/me', authMiddleware, controller.getMyCards);
  router.get('/:id/reveal', authMiddleware, controller.revealDetails);
  router.patch('/:id/toggle-lock', authMiddleware, controller.toggleLock);
  router.delete('/:id', authMiddleware, controller.remove);

  const app = mountTestApi(router, '/api/v1/cards');
  const tokens = new JwtTokenService();

  return {
    app,
    deps: {
      cardRepo,
      accountRepo,
      userRepo,
      notifRepo,
      userToken: tokens.generate({ userId: user.id, email: user.email.toString() }),
      userId: user.id,
      accountId: account.id,
      otherToken: tokens.generate({ userId: otherUser.id, email: otherUser.email.toString() }),
      otherUserId: otherUser.id,
      otherAccountId: otherAccount.id,
    },
  };
}
