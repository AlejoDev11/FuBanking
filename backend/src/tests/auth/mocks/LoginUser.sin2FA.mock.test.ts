/**
 * LoginUser (sin 2FA) — Pruebas con Mocks (vi.fn)
 *
 * Equivalente mock-based de LoginUser.sin2FA.test.ts.
 * Las dependencias se construyen con mockFactories para evitar duplicación
 * y cumplir con el Quality Gate de SonarCloud (duplicación ≤ 3%).
 *
 * Cubre:
 *   Camino 1,2,3,9,F     — email no registrado
 *   Camino 1,2,4,5,9,F   — cuenta inactiva
 *   Camino 1,2,4,6,7,9,F — contraseña incorrecta
 *   Camino 1,2,4,6,8,9,F — flujo feliz sin 2FA (con y sin rememberMe)
 *
 * Ejecutar: npx vitest run src/tests/auth/mocks/LoginUser.sin2FA.mock.test.ts
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { expect as assert } from '@assertive-ts/core';
import { LoginUser } from '../../../application/use-cases/auth/LoginUser';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { Document } from '../../../domain/value-objects/Document';
import {
  buildSin2FAUser,
  makeUserRepositoryMock,
  makeVerificationCodeRepositoryMock,
  makePasswordServiceMock,
  makeTokenServiceMock,
  makeEmailServiceMock,
} from './mockFactories';

describe('LoginUser (sin 2FA) — Pruebas con Mocks (vi.fn)', () => {
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

  // ── Camino 1,2,3,9,F — email no registrado ────────────────────────────
  describe('Camino 1,2,3,9,F — email no registrado', () => {
    it('lanza AuthError INVALID_CREDENTIALS cuando el email no existe en el repositorio', async () => {
      vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(null);

      await expect(
        loginUser.execute({ email: 'noexiste@mail.com', password: 'abc123' }),
      ).rejects.toMatchObject({
        message: 'Correo o contraseña incorrectos',
        code: 'INVALID_CREDENTIALS',
      });

      expect(mocks.emailService.sendTwoFactorCode).not.toHaveBeenCalled();
      expect(mocks.userRepository.findByEmail).toHaveBeenCalledWith('noexiste@mail.com');
    });
  });

  // ── Camino 1,2,4,5,9,F — cuenta inactiva ─────────────────────────────
  describe('Camino 1,2,4,5,9,F — user existe pero cuenta inactiva', () => {
    it('C2: Falla si el usuario existe pero la cuenta está inactiva', async () => {
      const usuarioInactivo = new User({
        id: 'user-inactivo',
        email: new Email('ana@mail.com'),
        document: new Document('123456789'),
        firstName: 'Ana',
        middleName: null,
        lastName: 'Gómez',
        secondLastName: null,
        birthDate: new Date('1995-03-10'),
        phone: null,
        avatarUrl: null,
        passwordHash: 'hashed_abc123',
        isActive: false,
        twoFactorEnabled: false,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(usuarioInactivo);

      await expect(
        loginUser.execute({ email: 'ana@mail.com', password: 'abc123' }),
      ).rejects.toMatchObject({
        message: 'Esta cuenta ha sido desactivada',
        code: 'ACCOUNT_INACTIVE',
      });

      expect(mocks.passwordService.compare).not.toHaveBeenCalled();
    });
  });

  // ── Camino 1,2,4,6,7,9,F — contraseña incorrecta ─────────────────────
  describe('Camino 1,2,4,6,7,9,F — user activo, password no coincide con el hash', () => {
    it('lanza AuthError INVALID_CREDENTIALS cuando la contraseña no coincide', async () => {
      vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(
        buildSin2FAUser({ isActive: true }),
      );
      vi.mocked(mocks.passwordService.compare).mockResolvedValue(false);

      await expect(
        loginUser.execute({ email: 'ana@mail.com', password: 'wrongpassword' }),
      ).rejects.toMatchObject({
        message: 'Correo o contraseña incorrectos',
        code: 'INVALID_CREDENTIALS',
      });

      expect(mocks.emailService.sendTwoFactorCode).not.toHaveBeenCalled();
      expect(mocks.passwordService.compare).toHaveBeenCalledWith('wrongpassword', 'hashed_abc123');
    });
  });

  // ── Camino 1,2,4,6,8,9,F — flujo feliz sin 2FA ───────────────────────
  describe('Camino 1,2,4,6,8,9,F — user activo, password correcta (flujo feliz sin 2FA)', () => {
    it('retorna { requiresTwoFactor:false, user, token } con token verificable', async () => {
      vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(
        buildSin2FAUser({ isActive: true, twoFactorEnabled: false }),
      );
      vi.mocked(mocks.passwordService.compare).mockResolvedValue(true);

      const result = await loginUser.execute({
        email: 'ana@mail.com',
        password: 'abc123',
        rememberMe: false,
      });

      assert(result.requiresTwoFactor).toBeFalse();
      assert((result as Record<string, unknown>).token).toBePresent();
      assert((result as Record<string, unknown>).user).toBePresent();

      const payload = mocks.tokenService.verify(
        (result as Record<string, unknown>).token as string,
      );
      assert(payload['userId']).toBeEqual('user-001');
      assert(payload['email']).toBeEqual('ana@mail.com');

      expect(mocks.emailService.sendTwoFactorCode).not.toHaveBeenCalled();
      expect(mocks.verificationCodeRepository.save).not.toHaveBeenCalled();
    });

    it('[caso extra] con rememberMe=true el token contiene el payload correcto', async () => {
      vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(
        buildSin2FAUser({ isActive: true, twoFactorEnabled: false }),
      );
      vi.mocked(mocks.passwordService.compare).mockResolvedValue(true);

      const result = await loginUser.execute({
        email: 'ana@mail.com',
        password: 'abc123',
        rememberMe: true,
      });

      assert(result.requiresTwoFactor).toBeFalse();
      const payload = mocks.tokenService.verify(
        (result as Record<string, unknown>).token as string,
      );
      assert(payload['userId']).toBeEqual('user-001');
      assert(payload['email']).toBeEqual('ana@mail.com');

      expect(mocks.tokenService.generate).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-001' }),
        expect.objectContaining({ expiresIn: '30d' }),
      );
    });
  });
});
