import { IResetTokenRepository } from '../../../domain/repositories/IResetTokenRepository';
import { ITokenService } from '../../interfaces/ITokenService';
import { AuthError } from '../../../shared/errors/AuthError';
import { hashToken } from '../../../infrastructure/repositories/SupabaseResetTokenRepository';

/**
 * Valida un token de restablecimiento (JWT tipo 'reset' + registro vigente en BD).
 * Lógica compartida por VerifyResetToken y ResetPassword.
 * Retorna el email del payload y el hash para marcar consumo.
 */
export async function resolveValidResetToken(
  tokenService: ITokenService,
  resetTokenRepository: IResetTokenRepository,
  token: string,
): Promise<{ email: string; tokenHash: string }> {
  let payload;
  try {
    payload = tokenService.verify(token);
  } catch {
    throw new AuthError('El enlace de recuperación es inválido o ha expirado', 'TOKEN_INVALID');
  }

  if (payload.type !== 'reset') {
    throw new AuthError('El enlace de recuperación es inválido', 'TOKEN_INVALID');
  }

  const tokenHash = hashToken(token);
  const tokenRecord = await resetTokenRepository.findByTokenHash(tokenHash);

  if (!tokenRecord) {
    throw new AuthError('El enlace de recuperación es inválido', 'TOKEN_INVALID');
  }

  if (tokenRecord.used) {
    throw new AuthError(
      'Este enlace ya fue utilizado. Por favor solicita un nuevo enlace de recuperación.',
      'TOKEN_ALREADY_USED',
    );
  }

  if (tokenRecord.expiresAt < new Date()) {
    throw new AuthError(
      'Este enlace ha expirado. Por favor solicita un nuevo enlace de recuperación.',
      'TOKEN_EXPIRED',
    );
  }

  return { email: payload.email, tokenHash };
}
