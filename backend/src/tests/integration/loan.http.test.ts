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
 * Regresión por contrato HTTP + seguridad del módulo créditos.
 * Patrón AAA + FIRST (ver ejemplo del profesor: RegressionTesting).
 * App con repos en memoria (sin Supabase, sin red).
 */
describe('Loans HTTP (contrato + seguridad)', () => {
  // ---------- REGRESIÓN: contrato ----------

  it('POST /simulate responde 200 con cuota calculada', async () => {
    // Arrange
    const { app, deps } = createLoanTestApp();
    // Act
    const res = await request(app)
      .post('/api/v1/loans/simulate')
      .set('Authorization', `Bearer ${deps.userToken}`)
      .send({ amount: 5_000_000, installments: 24, annualRate: 0.24 });
    // Assert
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.monthlyPayment).toBeGreaterThan(0);
  });

  it('POST / crea solicitud PENDING (201)', async () => {
    // Arrange
    const { app, deps } = createLoanTestApp();
    // Act
    const res = await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${deps.userToken}`)
      .send({ amount: 5_000_000, installments: 12, annualRate: 24, monthlyIncome: 1_800_000 });
    // Assert
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('PENDING');
  });

  it('POST / duplicado PENDING responde 400 LOAN_ALREADY_PENDING', async () => {
    // Arrange
    const { app, deps } = createLoanTestApp();
    const payload = { amount: 5_000_000, installments: 12, annualRate: 24, monthlyIncome: 1_800_000 };
    await request(app).post('/api/v1/loans').set('Authorization', `Bearer ${deps.userToken}`).send(payload);
    // Act
    const res = await request(app).post('/api/v1/loans').set('Authorization', `Bearer ${deps.userToken}`).send(payload);
    // Assert
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('LOAN_ALREADY_PENDING');
  });

  it('GET /me lista solo los préstamos propios', async () => {
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

  it('flujo admin: GET /admin + approve crea cuenta CREDITO', async () => {
    // Arrange
    const { app, deps } = createLoanTestApp();
    const created = await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${deps.userToken}`)
      .send({ amount: 5_000_000, installments: 12, annualRate: 24, monthlyIncome: 1_800_000 });
    const loanId = created.body.data.id as string;
    // Act
    const list = await request(app).get('/api/v1/loans/admin').set('Authorization', `Bearer ${deps.adminToken}`);
    const approved = await request(app)
      .patch(`/api/v1/loans/admin/${loanId}/approve`)
      .set('Authorization', `Bearer ${deps.adminToken}`);
    // Assert
    expect(list.status).toBe(200);
    expect(approved.status).toBe(200);
    expect(approved.body.data.status).toBe('APPROVED');
  });

  it('PATCH /admin/:id/reject rechaza un PENDING', async () => {
    // Arrange
    const { app, deps } = createLoanTestApp();
    const created = await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${deps.userToken}`)
      .send({ amount: 5_000_000, installments: 12, annualRate: 24, monthlyIncome: 1_800_000 });
    // Act
    const res = await request(app)
      .patch(`/api/v1/loans/admin/${created.body.data.id}/reject`)
      .set('Authorization', `Bearer ${deps.adminToken}`);
    // Assert
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('REJECTED');
  });

  // ---------- SEGURIDAD ----------

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

  // ---------- RATE LIMIT (configuración real de producción) ----------

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
