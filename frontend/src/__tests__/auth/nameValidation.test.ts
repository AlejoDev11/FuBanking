import { expect as assert } from '@assertive-ts/core';
import { isValidName } from '../../features/auth/utils/nameValidation';

describe('isValidName — Validación semántica de nombres', () => {
  // ─── Casos válidos ────────────────────────────────────────────────────────

  describe('Casos válidos', () => {
    it('acepta un nombre simple', () => {
      assert(isValidName('Juan')).toBeTrue();
    });

    it('acepta un nombre con tilde', () => {
      assert(isValidName('María')).toBeTrue();
    });

    it('acepta un apellido compuesto con guion', () => {
      assert(isValidName('García-López')).toBeTrue();
    });

    it('acepta nombre con apóstrofe (estilo anglosajón)', () => {
      assert(isValidName("O'Brien")).toBeTrue();
    });

    it('acepta nombre con eñe', () => {
      assert(isValidName('Nuñez')).toBeTrue();
    });

    it('acepta doble consonante corta (Lee, Ann)', () => {
      assert(isValidName('Lee')).toBeTrue();
      assert(isValidName('Ann')).toBeTrue();
    });

    it('acepta nombre con doble carácter seguido (no triple)', () => {
      // "aa" (2 repeticiones) → aceptado; "aaa" (3) → rechazado
      assert(isValidName('Aabria')).toBeTrue();
    });

    it('devuelve true para cadena vacía (campo opcional)', () => {
      assert(isValidName('')).toBeTrue();
      assert(isValidName('   ')).toBeTrue();
    });

    it('devuelve true para undefined (campo opcional)', () => {
      assert(isValidName(undefined)).toBeTrue();
    });

    it('acepta nombre completo con múltiples palabras', () => {
      assert(isValidName('Ana María')).toBeTrue();
    });
  });

  // ─── Casos inválidos ──────────────────────────────────────────────────────

  describe('Casos inválidos — 3 o más caracteres consecutivos', () => {
    it('rechaza "xxxxx"', () => {
      assert(isValidName('xxxxx')).toBeFalse();
    });

    it('rechaza "aaaaaa"', () => {
      assert(isValidName('aaaaaa')).toBeFalse();
    });

    it('rechaza "bbbbb"', () => {
      assert(isValidName('bbbbb')).toBeFalse();
    });

    it('rechaza triple repetición dentro de un nombre', () => {
      assert(isValidName('Jooohn')).toBeFalse();
    });

    it('rechaza triple repetición de consonante', () => {
      assert(isValidName('Brrron')).toBeFalse();
    });

    it('rechaza triple repetición indiferente a mayúsculas', () => {
      // /(.)\1{2,}/i — la i hace que 'AAA' también sea detectado
      assert(isValidName('AAA')).toBeFalse();
    });
  });

  describe('Casos inválidos — sin vocal', () => {
    it('rechaza cadena solo de consonantes "bcd"', () => {
      assert(isValidName('Bcd')).toBeFalse();
    });

    it('rechaza cadena de consonantes largas "QRSTZ"', () => {
      assert(isValidName('QRSTZ')).toBeFalse();
    });

    it('rechaza "Xyz"', () => {
      assert(isValidName('Xyz')).toBeFalse();
    });
  });
});
