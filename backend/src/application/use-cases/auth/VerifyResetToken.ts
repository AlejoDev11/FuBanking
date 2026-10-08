import { IResetTokenRepository } from '../../../domain/repositories/IResetTokenRepository';
import { ITokenService } from '../../interfaces/ITokenService';
import { resolveValidResetToken } from './resetTokenValidation';

export interface VerifyResetTokenDto {
  token: string;
}

/**
 * Caso de Uso: Verificar validez de un token de restablecimiento de contraseña.
 *
 * Permite al frontend consultar el estado del token al cargar la vista,
 * ANTES de mostrar el formulario (Defectos 4 y 5).
 *
 * Flujo:
 * 1. Verifica que el JWT sea válido y de tipo 'reset'.
 * 2. Busca el registro en BD por hash SHA-256.
 * 3. Evalúa: no existe → inválido, usado → TOKEN_ALREADY_USED, expirado → TOKEN_EXPIRED.
 * 4. Si la verificación es válida, retorna sin error.
 *
 * No consume el token (no lo marca como used).
 */
export class VerifyResetToken {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly resetTokenRepository: IResetTokenRepository,
  ) {}

  async execute(dto: VerifyResetTokenDto): Promise<void> {
    await resolveValidResetToken(this.tokenService, this.resetTokenRepository, dto.token);
  }
}
