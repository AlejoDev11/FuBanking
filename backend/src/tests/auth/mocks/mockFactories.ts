/**
 * mockFactories.ts
 *
 * Fábrica centralizada de mocks y builders de entidades para las pruebas
 * unitarias del módulo auth.
 *
 * Centralizar aquí evita duplicar la lógica del tokenService base64,
 * los objetos mock de repositorios y servicios, y los builders de entidades,
 * cumpliendo con el umbral de duplicación del Quality Gate de SonarCloud (≤ 3%).
 */

import { vi } from 'vitest';
import { User } from '../../../domain/entities/User';
import { VerificationCode } from '../../../domain/entities/VerificationCode';
import { Email } from '../../../domain/value-objects/Email';
import { Document } from '../../../domain/value-objects/Document';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { IVerificationCodeRepository } from '../../../domain/repositories/IVerificationCodeRepository';
import type { IPasswordService } from '../../../application/interfaces/IPasswordService';
import type { ITokenService } from '../../../application/interfaces/ITokenService';
import type { IEmailService } from '../../../application/interfaces/IEmailService';
import type { IResetTokenRepository } from '../../../domain/repositories/IResetTokenRepository';

// ─── Builders de entidades ──────────────────────────────────────────────────

export interface LoginUserOverrides {
  twoFactorEnabled?: boolean;
  isActive?: boolean;
}

/**
 * Construye un User de login genérico (juan@example.com / hashed_Segura123!).
 * Usado por LoginUser.mock y LoginUser.sin2FA.mock.
 */
export function buildLoginUser(overrides: LoginUserOverrides = {}): User {
  return new User({
    id: 'user-123',
    email: new Email('juan@example.com'),
    document: new Document('1234567890'),
    firstName: 'Juan',
    middleName: null,
    lastName: 'Pérez',
    secondLastName: null,
    birthDate: new Date('1990-01-01'),
    phone: null,
    avatarUrl: null,
    passwordHash: 'hashed_Segura123!',
    isActive: overrides.isActive ?? true,
    twoFactorEnabled: overrides.twoFactorEnabled ?? false,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

/**
 * Construye un User sin 2FA (ana@mail.com / hashed_abc123).
 * Usado por LoginUser.sin2FA.mock.
 */
export function buildSin2FAUser(overrides: LoginUserOverrides = {}): User {
  return new User({
    id: 'user-001',
    email: new Email('ana@mail.com'),
    document: new Document('1234567890'),
    firstName: 'Ana',
    middleName: null,
    lastName: 'Gómez',
    secondLastName: null,
    birthDate: new Date('1995-03-10'),
    phone: null,
    avatarUrl: null,
    passwordHash: 'hashed_abc123',
    isActive: overrides.isActive ?? true,
    twoFactorEnabled: overrides.twoFactorEnabled ?? false,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

/**
 * Construye un User para flujos de reset (ana@example.com / hashed_old_password).
 * Usado por PasswordReset.mock.
 */
export function buildResetUser(): User {
  return new User({
    id: 'user-reset-01',
    email: new Email('ana@example.com'),
    document: new Document('1234567890'),
    firstName: 'Ana',
    middleName: null,
    lastName: 'García',
    secondLastName: null,
    birthDate: new Date('1995-01-01'),
    phone: null,
    avatarUrl: null,
    passwordHash: 'hashed_old_password',
    isActive: true,
    twoFactorEnabled: false,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

/**
 * Construye un User con 2FA habilitado (juan@example.com).
 * Usado por VerifyTwoFactorCode.mock.
 */
export function buildTwoFactorUser(): User {
  return new User({
    id: 'user-123',
    email: new Email('juan@example.com'),
    document: new Document('1234567890'),
    firstName: 'Juan',
    middleName: null,
    lastName: 'Pérez',
    secondLastName: null,
    birthDate: new Date('1990-01-01'),
    phone: null,
    avatarUrl: null,
    passwordHash: 'hashed_password',
    isActive: true,
    twoFactorEnabled: true,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

/**
 * Construye un VerificationCode para pruebas de 2FA.
 */
export interface VerificationCodeOverrides {
  used?: boolean;
  expiresAt?: Date;
  attempts?: number;
}

export function buildVerificationCode(overrides: VerificationCodeOverrides = {}): VerificationCode {
  const future = new Date(Date.now() + 5 * 60 * 1_000);
  return new VerificationCode({
    id: 'vc-001',
    userId: 'user-123',
    codeHash: 'hashed_123456',
    expiresAt: overrides.expiresAt ?? future,
    attempts: overrides.attempts ?? 0,
    used: overrides.used ?? false,
    createdAt: new Date(),
  });
}

// ─── Fábricas de mocks de servicios ────────────────────────────────────────

/**
 * Crea un mock de ITokenService que codifica el payload en base64
 * (sin firma real) para que los tests puedan inspeccionar su contenido.
 * Registra las opciones del último generate() en `lastGenerateOptions`.
 */
export function makeTokenServiceMock() {
  const lastGenerateOptions: { value: Record<string, unknown> | undefined } = {
    value: undefined,
  };

  const tokenService = {
    generate: vi.fn((payload: object, options?: Record<string, unknown>) => {
      lastGenerateOptions.value = options;
      return `mock.${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
    }),
    verify: vi.fn((token: string) => {
      if (!token.startsWith('mock.')) {
        throw new Error('Token inválido');
      }
      return JSON.parse(
        Buffer.from(token.slice(5), 'base64').toString('utf-8'),
      ) as Record<string, unknown>;
    }),
    lastGenerateOptions,
  } as unknown as ITokenService & {
    lastGenerateOptions: { value: Record<string, unknown> | undefined };
  };

  return tokenService;
}

/**
 * Crea un mock completo de IUserRepository con todos sus métodos como vi.fn().
 */
export function makeUserRepositoryMock(): IUserRepository {
  return {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    findByDocument: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    updatePassword: vi.fn(),
    updateTwoFactor: vi.fn(),
    delete: vi.fn(),
    findByRole: vi.fn(),
  } as unknown as IUserRepository;
}

/**
 * Crea un mock completo de IVerificationCodeRepository.
 */
export function makeVerificationCodeRepositoryMock(): IVerificationCodeRepository {
  return {
    save: vi.fn(),
    findLatestByUserId: vi.fn(),
    update: vi.fn<[VerificationCode], Promise<void>>().mockResolvedValue(undefined),
    invalidateAllByUserId: vi.fn(),
  } as unknown as IVerificationCodeRepository;
}

/**
 * Crea un mock completo de IPasswordService.
 */
export function makePasswordServiceMock(): IPasswordService {
  return {
    hash: vi.fn(),
    compare: vi.fn(),
  } as unknown as IPasswordService;
}

/**
 * Crea un mock completo de IEmailService.
 */
export function makeEmailServiceMock(): IEmailService {
  return {
    sendTwoFactorCode: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
  } as unknown as IEmailService;
}

/**
 * Crea un mock completo de IResetTokenRepository.
 */
export function makeResetTokenRepositoryMock(): IResetTokenRepository {
  return {
    save: vi.fn(),
    findByTokenHash: vi.fn(),
    invalidateAllByUserId: vi.fn(),
    markAsUsed: vi.fn(),
  } as unknown as IResetTokenRepository;
}
