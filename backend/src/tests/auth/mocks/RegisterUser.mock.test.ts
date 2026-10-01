/**
 * RegisterUser — Pruebas con Mocks (vi.fn)
 *
 * Equivalente mock-based de RegisterUser.test.ts.
 * Las dependencias se construyen con mockFactories para evitar duplicación
 * y cumplir con el Quality Gate de SonarCloud (duplicación ≤ 3%).
 *
 * Cubre:
 *   N1→N2→N3                       Contraseñas no coinciden
 *   N1→N2→N4→N5→N6                 Email ya existe
 *   N1→N2→N4→N5→N7→N8→N9          Documento ya existe
 *   N1→N2→N4→N5→N7→N8→N10→N11     Registro exitoso
 *
 * Ejecutar: npx vitest run src/tests/auth/mocks/RegisterUser.mock.test.ts
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { expect as assert } from '@assertive-ts/core';
import { RegisterUser } from '../../../application/use-cases/auth/RegisterUser';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { Document } from '../../../domain/value-objects/Document';
import {
  makeUserRepositoryMock,
  makePasswordServiceMock,
  makeTokenServiceMock,
} from './mockFactories';

// ─── DTO base y usuario existente ──────────────────────────────────────────

const BASE_DTO = {
  firstName: 'Juan',
  lastName: 'Pérez',
  birthDate: '1990-01-01',
  email: 'juan@test.com',
  document: 'XYZ98765',
  password: 'Password123',
  confirmPassword: 'Password123',
};

function buildExistingUser(): User {
  return new User({
    id: 'existing-user-001',
    email: new Email('existing@test.com'),
    document: new Document('ABC12345'),
    firstName: 'Existing',
    middleName: null,
    lastName: 'User',
    secondLastName: null,
    birthDate: new Date('1990-01-01'),
    phone: null,
    avatarUrl: null,
    passwordHash: 'hashed_Password123',
    isActive: true,
    twoFactorEnabled: false,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// ─── Suite ─────────────────────────────────────────────────────────────────

describe('RegisterUser — Pruebas con Mocks (vi.fn)', () => {
  let mocks: {
    userRepository: ReturnType<typeof makeUserRepositoryMock>;
    passwordService: ReturnType<typeof makePasswordServiceMock>;
    tokenService: ReturnType<typeof makeTokenServiceMock>;
  };
  let registerUser: RegisterUser;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = {
      userRepository: makeUserRepositoryMock(),
      passwordService: makePasswordServiceMock(),
      tokenService: makeTokenServiceMock(),
    };
    registerUser = new RegisterUser(
      mocks.userRepository,
      mocks.passwordService,
      mocks.tokenService,
    );
  });

  // ── N1→N2→N4→N5→N7→N8→N10→N11 — Registro exitoso ──────────────────────
  describe('N1→N2→N4→N5→N7→N8→N10→N11', () => {
    it('registra correctamente un nuevo usuario y retorna user + token', async () => {
      vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mocks.userRepository.findByDocument).mockResolvedValue(null);
      vi.mocked(mocks.passwordService.hash).mockResolvedValue('hashed_Password123');
      vi.mocked(mocks.userRepository.save).mockImplementation(async (user) => user);

      const result = await registerUser.execute(BASE_DTO);

      assert(result).toBePresent();
      assert(result.token).toBePresent();
      assert(result.user).toBePresent();
      assert(result.user.email).toBeEqual('juan@test.com');
      assert(result.user.firstName).toBeEqual('Juan');

      const payload = mocks.tokenService.verify(result.token);
      assert(payload['email']).toBeEqual('juan@test.com');

      expect(mocks.userRepository.findByEmail).toHaveBeenCalledWith('juan@test.com');
      expect(mocks.userRepository.findByDocument).toHaveBeenCalledWith('XYZ98765');
      expect(mocks.passwordService.hash).toHaveBeenCalledWith('Password123');
      expect(mocks.userRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  // ── N1→N2→N3 — Contraseñas no coinciden ────────────────────────────────
  describe('N1→N2→N3', () => {
    it('lanza PASSWORDS_DONT_MATCH cuando confirmPassword no coincide', async () => {
      await expect(
        registerUser.execute({ ...BASE_DTO, confirmPassword: 'OtraPassword456' }),
      ).rejects.toMatchObject({ code: 'PASSWORDS_DONT_MATCH', statusCode: 400 });

      expect(mocks.userRepository.findByEmail).not.toHaveBeenCalled();
      expect(mocks.userRepository.save).not.toHaveBeenCalled();
    });
  });

  // ── N1→N2→N4→N5→N6 — Email ya existe ───────────────────────────────────
  describe('N1→N2→N4→N5→N6', () => {
    it('lanza EMAIL_ALREADY_EXISTS cuando el email ya está registrado', async () => {
      vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(buildExistingUser());

      await expect(
        registerUser.execute({ ...BASE_DTO, email: 'existing@test.com' }),
      ).rejects.toMatchObject({ code: 'EMAIL_ALREADY_EXISTS' });

      expect(mocks.userRepository.save).not.toHaveBeenCalled();
      expect(mocks.passwordService.hash).not.toHaveBeenCalled();
    });
  });

  // ── N1→N2→N4→N5→N7→N8→N9 — Documento ya existe ─────────────────────────
  describe('N1→N2→N4→N5→N7→N8→N9', () => {
    it('lanza DOCUMENT_ALREADY_EXISTS cuando el documento ya está registrado', async () => {
      vi.mocked(mocks.userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mocks.userRepository.findByDocument).mockResolvedValue(buildExistingUser());

      await expect(
        registerUser.execute({ ...BASE_DTO, document: 'ABC12345' }),
      ).rejects.toMatchObject({ code: 'DOCUMENT_ALREADY_EXISTS' });

      expect(mocks.userRepository.save).not.toHaveBeenCalled();
      expect(mocks.passwordService.hash).not.toHaveBeenCalled();
    });
  });
});
