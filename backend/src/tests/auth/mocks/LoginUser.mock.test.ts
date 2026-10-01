/**
 * LoginUser — Pruebas con Mocks (vi.fn)
 *
 * Equivalente mock-based de LoginUser.test.ts.
 * Las dependencias se construyen con mockFactories para evitar duplicación
 * y cumplir con el Quality Gate de SonarCloud (duplicación ≤ 3%).
 *
 * Ejecutar: npx vitest run src/tests/auth/mocks/LoginUser.mock.test.ts
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { expect as assert } from '@assertive-ts/core';
import { LoginUser } from '../../../application/use-cases/auth/LoginUser';
import {
  buildLoginUser,
  makeUserRepositoryMock,
  makeVerificationCodeRepositoryMock,
  makePasswordServiceMock,
  makeTokenServiceMock,
  makeEmailServiceMock,
} from './mockFactories';

describe('LoginUser — Pruebas con Mocks (vi.fn)', () => {
  let mocks: {
    userRepository: ReturnType<typeof makeUserRepositoryMock>;
    verificationCodeRepository: ReturnType<typeof makeVerificationCodeRepositoryMock>;
    passwordService: ReturnType<typeof makePasswordServiceMock>;
    tokenService: ReturnType<typeof makeTokenServiceMock>;
    emailService: ReturnType<typeof makeEmailServiceMock>;
  };
  let loginUser: LoginUser;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = {
      userRepository: makeUserRepositoryMock(),
      verificationCodeRepository: makeVerificationCodeRepositoryMock(),
      passwordService: makePasswordServiceMock(),
      tokenService: makeTokenServiceMock(),
      emailService: makeEmailServiceMock(),
    };
    loginUser = new LoginUser(
      mocks.userRepository,
      mocks.passwordService,
      mocks.tokenService,
      mocks.verificationCodeRepository,
      mocks.emailService,
    );
  });

  // ── C1 ──────────────────────────────────────────────────────────────────
  it('C1 - login exitoso sin 2FA: retorna token JWT directamente', async () => {
    const user = buildLoginUser({ twoFactorEnabled: false });
    vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(user);
    vi.mocked(mocks.passwordService.compare).mockResolvedValue(true);

    const result = await loginUser.execute({ email: 'juan@example.com', password: 'Segura123!' });

    assert(result.requiresTwoFactor).toBeFalse();
    assert((result as Record<string, unknown>).token).toBePresent();
    assert((result as Record<string, unknown>).user).toBePresent();

    const payload = mocks.tokenService.verify(
      (result as Record<string, unknown>).token as string,
    );
    assert(payload['userId']).toBeEqual('user-123');
    assert(payload['email']).toBeEqual('juan@example.com');

    expect(mocks.emailService.sendTwoFactorCode).not.toHaveBeenCalled();
    expect(mocks.userRepository.findByEmail).toHaveBeenCalledWith('juan@example.com');
    expect(mocks.passwordService.compare).toHaveBeenCalledWith('Segura123!', 'hashed_Segura123!');
  });

  // ── C2 ──────────────────────────────────────────────────────────────────
  it('C2 - login con 2FA habilitado: genera OTP, envía correo y retorna temporaryToken', async () => {
    const user = buildLoginUser({ twoFactorEnabled: true });
    vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(user);
    vi.mocked(mocks.passwordService.compare).mockResolvedValue(true);
    vi.mocked(mocks.passwordService.hash).mockImplementation(
      async (plain: string) => `hashed_${plain}`,
    );
    vi.mocked(mocks.verificationCodeRepository.save).mockResolvedValue({} as never);
    vi.mocked(mocks.emailService.sendTwoFactorCode).mockResolvedValue();

    const result = await loginUser.execute({ email: 'juan@example.com', password: 'Segura123!' });

    assert(result.requiresTwoFactor).toBeTrue();
    assert((result as Record<string, unknown>).temporaryToken).toBePresent();
    expect((result as Record<string, unknown>).maskedEmail).toMatch(/\*{3}@example\.com/);

    expect(mocks.emailService.sendTwoFactorCode).toHaveBeenCalledTimes(1);
    const [emailArg, codeArg] =
      vi.mocked(mocks.emailService.sendTwoFactorCode).mock.calls[0] ?? [];
    assert(emailArg).toBeEqual('juan@example.com');
    expect(codeArg).toMatch(/^\d{6}$/);
    expect(mocks.verificationCodeRepository.save).toHaveBeenCalledTimes(1);
  });

  // ── C3 ──────────────────────────────────────────────────────────────────
  it('C3 - usuario no encontrado: lanza error INVALID_CREDENTIALS', async () => {
    vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(null);

    await expect(
      loginUser.execute({ email: 'noexiste@example.com', password: 'cualquier' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });

    expect(mocks.passwordService.compare).not.toHaveBeenCalled();
    expect(mocks.emailService.sendTwoFactorCode).not.toHaveBeenCalled();
  });

  // ── C4 ──────────────────────────────────────────────────────────────────
  it('C4 - contraseña incorrecta: lanza error INVALID_CREDENTIALS', async () => {
    vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(buildLoginUser());
    vi.mocked(mocks.passwordService.compare).mockResolvedValue(false);

    await expect(
      loginUser.execute({ email: 'juan@example.com', password: 'ContraseñaIncorrecta!' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });

    expect(mocks.emailService.sendTwoFactorCode).not.toHaveBeenCalled();
  });

  // ── C5 ──────────────────────────────────────────────────────────────────
  it('C5 - cuenta inactiva: lanza error ACCOUNT_INACTIVE', async () => {
    vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(
      buildLoginUser({ isActive: false }),
    );

    await expect(
      loginUser.execute({ email: 'juan@example.com', password: 'Segura123!' }),
    ).rejects.toMatchObject({ code: 'ACCOUNT_INACTIVE' });

    expect(mocks.passwordService.compare).not.toHaveBeenCalled();
  });
});
