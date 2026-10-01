/**
 * RequestPasswordReset / ResetPassword — Pruebas con Mocks (vi.fn)
 *
 * Equivalente mock-based de PasswordReset.backend.test.ts.
 * Las dependencias se construyen con mockFactories para evitar duplicación
 * y cumplir con el Quality Gate de SonarCloud (duplicación ≤ 3%).
 *
 * RequestPasswordReset:
 *   C1 — Email no existe → retorna sin enviar correo
 *   C2 — Email existe → genera token, persiste hash y envía correo
 *
 * ResetPassword:
 *   C2 — Contraseñas no coinciden → PASSWORDS_DONT_MATCH
 *   C3 — Token JWT inválido → TOKEN_INVALID
 *   C4 — Token válido pero type !== 'reset' → TOKEN_INVALID
 *   C5 — Todo válido → contraseña hasheada y actualizada
 *
 * Ejecutar: npx vitest run src/tests/auth/mocks/PasswordReset.mock.test.ts
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { expect as assert } from '@assertive-ts/core';
import { RequestPasswordReset } from '../../../application/use-cases/auth/RequestPasswordReset';
import { ResetPassword } from '../../../application/use-cases/auth/ResetPassword';
import { hashToken } from '../../../infrastructure/repositories/SupabaseResetTokenRepository';
import type { ResetTokenRecord } from '../../../domain/repositories/IResetTokenRepository';
import {
  buildResetUser,
  makeUserRepositoryMock,
  makePasswordServiceMock,
  makeTokenServiceMock,
  makeEmailServiceMock,
  makeResetTokenRepositoryMock,
} from './mockFactories';

// ─── Suite: RequestPasswordReset ───────────────────────────────────────────

describe('RequestPasswordReset — Pruebas con Mocks (vi.fn)', () => {
  let mocks: {
    userRepository: ReturnType<typeof makeUserRepositoryMock>;
    tokenService: ReturnType<typeof makeTokenServiceMock>;
    emailService: ReturnType<typeof makeEmailServiceMock>;
    resetTokenRepository: ReturnType<typeof makeResetTokenRepositoryMock>;
  };
  let requestReset: RequestPasswordReset;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = {
      userRepository: makeUserRepositoryMock(),
      tokenService: makeTokenServiceMock(),
      emailService: makeEmailServiceMock(),
      resetTokenRepository: makeResetTokenRepositoryMock(),
    };
    process.env['CLIENT_URL'] = 'http://localhost:3000';
    requestReset = new RequestPasswordReset(
      mocks.userRepository,
      mocks.tokenService,
      mocks.emailService,
      mocks.resetTokenRepository,
    );
  });

  // ── C1 ──────────────────────────────────────────────────────────────────
  it('C1 — email no corresponde a ningún usuario: retorna sin enviar correo', async () => {
    vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(null);

    await requestReset.execute({ email: 'noexiste@example.com' });

    expect(mocks.emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(mocks.resetTokenRepository.save).not.toHaveBeenCalled();
    expect(mocks.tokenService.generate).not.toHaveBeenCalled();
  });

  // ── C2 ──────────────────────────────────────────────────────────────────
  it('C2 — usuario existe: genera token y envía correo de recuperación', async () => {
    vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(buildResetUser());
    vi.mocked(mocks.resetTokenRepository.invalidateAllByUserId).mockResolvedValue();
    vi.mocked(mocks.resetTokenRepository.save).mockResolvedValue({} as ResetTokenRecord);
    vi.mocked(mocks.emailService.sendPasswordResetEmail).mockResolvedValue();

    await requestReset.execute({ email: 'ana@example.com' });

    expect(mocks.emailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);

    const [emailArg, resetLinkArg] =
      vi.mocked(mocks.emailService.sendPasswordResetEmail).mock.calls[0] ?? [];
    assert(emailArg).toBeEqual('ana@example.com');
    assert(resetLinkArg as string).toContain('reset-password?token=');

    const tokenInLink = resetLinkArg?.split('token=')[1];
    assert(tokenInLink).toBePresent();
    const payload = mocks.tokenService.verify(tokenInLink as string);
    assert(payload['userId']).toBeEqual('user-reset-01');
    assert(payload['email']).toBeEqual('ana@example.com');
    assert(payload['type']).toBeEqual('reset');

    expect(mocks.resetTokenRepository.invalidateAllByUserId).toHaveBeenCalledWith('user-reset-01');
    expect(mocks.resetTokenRepository.save).toHaveBeenCalledTimes(1);
  });
});

// ─── Suite: ResetPassword ──────────────────────────────────────────────────

describe('ResetPassword — Pruebas con Mocks (vi.fn)', () => {
  let mocks: {
    userRepository: ReturnType<typeof makeUserRepositoryMock>;
    passwordService: ReturnType<typeof makePasswordServiceMock>;
    tokenService: ReturnType<typeof makeTokenServiceMock>;
    resetTokenRepository: ReturnType<typeof makeResetTokenRepositoryMock>;
  };
  let resetPassword: ResetPassword;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = {
      userRepository: makeUserRepositoryMock(),
      passwordService: makePasswordServiceMock(),
      tokenService: makeTokenServiceMock(),
      resetTokenRepository: makeResetTokenRepositoryMock(),
    };
    resetPassword = new ResetPassword(
      mocks.userRepository,
      mocks.passwordService,
      mocks.tokenService,
      mocks.resetTokenRepository,
    );
  });

  // ── C2 ──────────────────────────────────────────────────────────────────
  it('C2 — contraseñas no coinciden: lanza PASSWORDS_DONT_MATCH (400)', async () => {
    await expect(
      resetPassword.execute({
        token: 'cualquier-token',
        newPassword: 'NuevaPass1!',
        confirmPassword: 'Diferente2@',
      }),
    ).rejects.toMatchObject({ code: 'PASSWORDS_DONT_MATCH', statusCode: 400 });

    expect(mocks.tokenService.verify).not.toHaveBeenCalled();
  });

  // ── C3 ──────────────────────────────────────────────────────────────────
  it('C3 — contraseñas coinciden pero token inválido: lanza TOKEN_INVALID', async () => {
    await expect(
      resetPassword.execute({
        token: 'invalid.token.for.testing',
        newPassword: 'NuevaPass1!',
        confirmPassword: 'NuevaPass1!',
      }),
    ).rejects.toMatchObject({ code: 'TOKEN_INVALID' });

    expect(mocks.userRepository.updatePassword).not.toHaveBeenCalled();
  });

  // ── C4 ──────────────────────────────────────────────────────────────────
  it('C4 — token válido pero type !== "reset": lanza TOKEN_INVALID por tipo incorrecto', async () => {
    const wrongTypeToken = mocks.tokenService.generate({
      userId: 'user-reset-01',
      email: 'ana@example.com',
      type: 'auth',
    });

    await expect(
      resetPassword.execute({
        token: wrongTypeToken,
        newPassword: 'NuevaPass1!',
        confirmPassword: 'NuevaPass1!',
      }),
    ).rejects.toMatchObject({ code: 'TOKEN_INVALID' });

    expect(mocks.userRepository.updatePassword).not.toHaveBeenCalled();
  });

  // ── C5 ──────────────────────────────────────────────────────────────────
  it('C5 — todo válido: contraseña hasheada y actualizada en BD', async () => {
    const user = buildResetUser();
    const validToken = mocks.tokenService.generate({
      userId: 'user-reset-01',
      email: 'ana@example.com',
      type: 'reset',
    });
    const tokenRecord: ResetTokenRecord = {
      id: 'record-1',
      tokenHash: hashToken(validToken),
      userId: 'user-reset-01',
      used: false,
      expiresAt: new Date(Date.now() + 500_000),
      createdAt: new Date(),
    };

    vi.mocked(mocks.resetTokenRepository.findByTokenHash).mockResolvedValue(tokenRecord);
    vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(user);
    vi.mocked(mocks.passwordService.hash).mockResolvedValue('hashed_NuevaPass1!');
    vi.mocked(mocks.userRepository.updatePassword).mockResolvedValue(user);
    vi.mocked(mocks.resetTokenRepository.markAsUsed).mockResolvedValue();

    await resetPassword.execute({
      token: validToken,
      newPassword: 'NuevaPass1!',
      confirmPassword: 'NuevaPass1!',
    });

    expect(mocks.passwordService.hash).toHaveBeenCalledWith('NuevaPass1!');
    expect(mocks.userRepository.updatePassword).toHaveBeenCalledWith(
      'user-reset-01',
      'hashed_NuevaPass1!',
    );
    expect(mocks.resetTokenRepository.markAsUsed).toHaveBeenCalledWith(hashToken(validToken));
  });
});
