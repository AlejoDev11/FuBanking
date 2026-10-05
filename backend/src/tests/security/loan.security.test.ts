import request from 'supertest';
import express, { NextFunction, Request, Response } from 'express';
import { createLoanTestApp } from '../helpers/createLoanTestApp';
import { errorHandler } from '../../presentation/middlewares/errorHandler';
import { simulateLimiter, createLoanLimiter } from '../../presentation/routes/loan.routes';
import { loginRateLimiter } from '../../presentation/routes/auth.routes';

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

/** Mini-app que monta un limiter real de producción con un handler 200. */
function appWithLimiter(limiter: Middleware) {
  const app = express();
  app.get('/probe', limiter, (_req: Request, res: Response) => res.json({ success: true, data: 'ok' }));
  app.use(errorHandler);
  return app;
}

/**
 * Security testing del módulo créditos (+ login como base común).
 * Patrón AAA + FIRST: tablas negativas, asserts not.toContain/400/401/403/429.
 * App con repos en memoria (sin Supabase, sin red).
 *
 * Ejecutar: npm run test:security (o npx vitest run src/tests/security)
 */
describe('Loans HTTP (seguridad)', () => {
  it('GET /me lista solo los préstamos propios (aislamiento)', async () => {
    // Arrange
    const { app, deps } = createLoanTestApp();
    await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${deps.userToken}`)
      .send({ amount: 5_000_000, installments: 12, annualRate: 24, monthlyIncome: 1_800_000 });
    // Act
    const mine = await request(app).get('/api/v1/loans/me').set('Authorization', `Bearer ${deps.userToken}`);
    const adminView = await request(app).get('/api/v1/loans/me').set('Authorization', `Bearer ${deps.adminToken}`);
    // Assert
    expect(mine.status).toBe(200);
    expect(mine.body.data).toHaveLength(1);
    expect(adminView.body.data).toHaveLength(0);
  });

  it.each([['/simulate'], ['/']])('401 sin token en POST %s', async (path) => {
    // Arrange
    const { app } = createLoanTestApp();
    // Act
    const res = await request(app)
      .post(`/api/v1/loans${path}`)
      .send({ amount: 5_000_000, installments: 24, annualRate: 0.24 });
    // Assert
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('401 sin token en rutas GET protegidas', async () => {
    // Arrange
    const { app } = createLoanTestApp();
    // Act
    const me = await request(app).get('/api/v1/loans/me');
    const admin = await request(app).get('/api/v1/loans/admin');
    // Assert
    expect(me.status).toBe(401);
    expect(me.body.error.code).toBe('UNAUTHORIZED');
    expect(admin.status).toBe(401);
  });

  it('401 con token inválido', async () => {
    // Arrange
    const { app } = createLoanTestApp();
    // Act
    const res = await request(app)
      .post('/api/v1/loans/simulate')
      .set('Authorization', 'Bearer invalido')
      .send({ amount: 5_000_000, installments: 24, annualRate: 0.24 });
    // Assert
    expect(res.status).toBe(401);
  });

  it('403 no-admin en GET /admin y PATCH approve', async () => {
    // Arrange
    const { app, deps } = createLoanTestApp();
    // Act
    const list = await request(app).get('/api/v1/loans/admin').set('Authorization', `Bearer ${deps.userToken}`);
    const approve = await request(app)
      .patch('/api/v1/loans/admin/00000000-0000-4000-8000-000000000000/approve')
      .set('Authorization', `Bearer ${deps.userToken}`);
    // Assert
    expect(list.status).toBe(403);
    expect(list.body.error.code).toBe('FORBIDDEN');
    expect(approve.status).toBe(403);
  });

  it.each([
    [{ amount: -100, installments: 24, annualRate: 0.24 }, 'amount'],
    [{ amount: 5_000_000, installments: 0, annualRate: 0.24 }, 'installments'],
    [{ amount: 5_000_000, installments: 24, annualRate: -1 }, 'annualRate'],
  ])('400 fuzz en simulate: %o', async (payload) => {
    // Arrange
    const { app, deps } = createLoanTestApp();
    // Act
    const res = await request(app)
      .post('/api/v1/loans/simulate')
      .set('Authorization', `Bearer ${deps.userToken}`)
      .send(payload);
    // Assert
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('400 con id no-uuid en approve', async () => {
    // Arrange
    const { app, deps } = createLoanTestApp();
    // Act
    const res = await request(app)
      .patch('/api/v1/loans/admin/no-es-uuid/approve')
      .set('Authorization', `Bearer ${deps.adminToken}`);
    // Assert
    expect(res.status).toBe(400);
  });

  // NOTA: se prueban los singletons reales de producción (no factorías frescas)
  // para evidenciar su configuración. Es determinista porque vitest aísla
  // módulos por archivo y cada limiter tiene su propio store en memoria.
  it('429 al superar simulateLimiter (30/min)', async () => {
    // Arrange
    const app = appWithLimiter(simulateLimiter);
    // Act: 30 permitidas + 1 que debe rebotar
    for (let i = 0; i < 30; i++) {
      await request(app).get('/probe');
    }
    const res = await request(app).get('/probe');
    // Assert
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(res.headers['retry-after']).toBeDefined();
  });

  it('429 al superar createLoanLimiter (10/min)', async () => {
    // Arrange
    const app = appWithLimiter(createLoanLimiter);
    // Act
    for (let i = 0; i < 10; i++) {
      await request(app).get('/probe');
    }
    const res = await request(app).get('/probe');
    // Assert
    expect(res.status).toBe(429);
  });

  it('429 al superar loginRateLimiter (10/min por email+IP)', async () => {
    // Arrange
    const app = appWithLimiter(loginRateLimiter);
    // Act
    for (let i = 0; i < 10; i++) {
      await request(app).get('/probe');
    }
    const res = await request(app).get('/probe');
    // Assert
    expect(res.status).toBe(429);
  });
});
