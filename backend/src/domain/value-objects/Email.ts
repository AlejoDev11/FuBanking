/**
 * Value Object: Email
 *
 * Encapsula la validación del correo electrónico en el dominio.
 * Al ser inmutable, garantiza que cualquier instancia de Email siempre
 * contiene un valor válido y normalizado.
 *
 * Pertenece al dominio: no conoce Express, Supabase ni ninguna librería externa.
 */
export class Email {
  private readonly value: string;

  constructor(email: string) {
    const normalized = email.toLowerCase().trim();

    if (!Email.isValidFormat(normalized)) {
      throw new Error(`"${email}" no es un correo electrónico válido`);
    }

    this.value = normalized;
  }

  /**
   * Valida el formato sin expresiones regulares con backtracking.
   * Equivale a `^[^\s@]+@[^\s@]+\.[^\s@]+$` con tiempo lineal garantizado.
   */
  private static isValidFormat(email: string): boolean {
    const atIndex = email.indexOf('@');
    if (atIndex <= 0 || atIndex !== email.lastIndexOf('@')) {
      return false;
    }
    const local = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);
    if (Email.hasWhitespace(local) || Email.hasWhitespace(domain)) {
      return false;
    }
    const dotIndex = domain.indexOf('.');
    return dotIndex > 0 && dotIndex < domain.length - 1;
  }

  private static hasWhitespace(value: string): boolean {
    for (const char of value) {
      if (char === ' ' || char === '\t' || char === '\n' || char === '\r' || char === '\f' || char === '\v') {
        return true;
      }
    }
    return false;
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
