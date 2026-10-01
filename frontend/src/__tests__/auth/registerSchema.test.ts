import { expect as assert } from '@assertive-ts/core';
import { registerSchema, PASSWORD_MAX_LENGTH } from '../../features/auth/schemas/auth.schemas';

const BASE_VALID = {
  firstName: 'Juan',
  lastName: 'Pérez',
  birthDate: '1990-01-01',
  email: 'juan@test.com',
  document: 'ABC12345',
  password: 'Password123',
  confirmPassword: 'Password123',
};

// ─── Caminos originales (caja blanca) ─────────────────────────────────────────

describe('registerSchema — Pruebas de caja blanca (tabla de caminos Zod)', () => {
  describe('1,2,4,6,8,10,12,14,16,F', () => {
    it('1,2,4,6,8,10,12,14,16,F', () => {
      const result = registerSchema.safeParse(BASE_VALID);

      assert(result.success).toBeTrue();
    });
  });

  describe('1,2,3,F', () => {
    it('1,2,3,F', () => {
      const result = registerSchema.safeParse({ ...BASE_VALID, firstName: 'J' });

      assert(result.success).toBeFalse();
      if (!result.success) {
        const firstNameIssues = result.error.issues.filter((i) => i.path.includes('firstName'));
        assert(firstNameIssues.length >= 1).toBeTrue();
        assert(firstNameIssues[0]!.message).toBeEqual('El primer nombre debe tener al menos 2 caracteres');
      }
    });
  });

  describe('1,2,4,5,F', () => {
    it('1,2,4,5,F', () => {
      const result = registerSchema.safeParse({ ...BASE_VALID, lastName: 'P3rez' });

      assert(result.success).toBeFalse();
      if (!result.success) {
        const lastNameIssues = result.error.issues.filter((i) => i.path.includes('lastName'));
        assert(lastNameIssues.length >= 1).toBeTrue();
        expect(lastNameIssues[0]!.message).toContain('Solo se permiten letras');
      }
    });
  });

  describe('1,2,4,6,7,F', () => {
    it('1,2,4,6,7,F', () => {
      const result = registerSchema.safeParse({ ...BASE_VALID, birthDate: '2030-01-01' });

      assert(result.success).toBeFalse();
      if (!result.success) {
        const birthDateIssues = result.error.issues.filter((i) => i.path.includes('birthDate'));
        assert(birthDateIssues.length >= 1).toBeTrue();
        assert(birthDateIssues[0]!.message).toBeEqual('La fecha no puede ser en el futuro');
      }
    });
  });

  describe('1,2,4,6,8,9,F', () => {
    it('1,2,4,6,8,9,F', () => {
      const result = registerSchema.safeParse({ ...BASE_VALID, email: 'correo-invalido' });

      assert(result.success).toBeFalse();
      if (!result.success) {
        const emailIssues = result.error.issues.filter((i) => i.path.includes('email'));
        assert(emailIssues.length >= 1).toBeTrue();
        assert(emailIssues[0]!.message).toBeEqual('Correo electrónico inválido');
      }
    });
  });

  describe('1,2,4,6,8,10,11,F', () => {
    it('1,2,4,6,8,10,11,F', () => {
      const result = registerSchema.safeParse({ ...BASE_VALID, document: 'AB1' });

      assert(result.success).toBeFalse();
      if (!result.success) {
        const documentIssues = result.error.issues.filter((i) => i.path.includes('document'));
        assert(documentIssues.length >= 1).toBeTrue();
        assert(documentIssues[0]!.message).toBeEqual('Documento inválido');
      }
    });
  });

  describe('1,2,4,6,8,10,12,13,F', () => {
    it('1,2,4,6,8,10,12,13,F', () => {
      const result = registerSchema.safeParse({
        ...BASE_VALID,
        password: 'abcdefgh',
        confirmPassword: 'abcdefgh',
      });

      assert(result.success).toBeFalse();
      if (!result.success) {
        const passwordIssues = result.error.issues.filter((i) => i.path.includes('password'));
        assert(passwordIssues.length >= 1).toBeTrue();
        assert(passwordIssues[0]!.message).toBeEqual('Debe contener al menos una mayúscula');
      }
    });
  });

  describe('1,2,4,6,8,10,12,14,15,F', () => {
    it('1,2,4,6,8,10,12,14,15,F', () => {
      const result = registerSchema.safeParse({
        ...BASE_VALID,
        password: 'Password123',
        confirmPassword: 'Otra456X',
      });

      assert(result.success).toBeFalse();
      if (!result.success) {
        const confirmIssues = result.error.issues.filter((i) => i.path.includes('confirmPassword'));
        assert(confirmIssues.length >= 1).toBeTrue();
        assert(confirmIssues[0]!.message).toBeEqual('Las contraseñas no coinciden');
      }
    });
  });
});

// ─── Defecto 2: Límite máximo de contraseña ───────────────────────────────────

describe('registerSchema — Defecto 2: límite máximo de contraseña', () => {
  it('acepta una contraseña en el límite exacto (128 chars)', () => {
    const pwd = 'Abc1' + 'x'.repeat(PASSWORD_MAX_LENGTH - 4);
    const result = registerSchema.safeParse({
      ...BASE_VALID,
      password: pwd,
      confirmPassword: pwd,
    });
    assert(result.success).toBeTrue();
  });

  it('rechaza una contraseña que supera el límite máximo (129 chars)', () => {
    const pwd = 'Abc1' + 'x'.repeat(PASSWORD_MAX_LENGTH - 3);
    const result = registerSchema.safeParse({
      ...BASE_VALID,
      password: pwd,
      confirmPassword: pwd,
    });
    assert(result.success).toBeFalse();
    if (!result.success) {
      const issues = result.error.issues.filter((i) => i.path.includes('password'));
      assert(issues.some((i) => i.message.includes(`${PASSWORD_MAX_LENGTH}`))).toBeTrue();
    }
  });
});

// ─── Defecto 3: Validación semántica de nombres ───────────────────────────────

describe('registerSchema — Defecto 3: nombres con caracteres repetidos', () => {
  it('rechaza firstName con 3 o más caracteres consecutivos idénticos', () => {
    const result = registerSchema.safeParse({ ...BASE_VALID, firstName: 'Joooohn' });
    assert(result.success).toBeFalse();
    if (!result.success) {
      const issues = result.error.issues.filter((i) => i.path.includes('firstName'));
      assert(issues.length >= 1).toBeTrue();
      assert(issues[0]!.message).toBeEqual('El nombre no puede contener 3 o más caracteres iguales consecutivos ni carecer de vocales');
    }
  });

  it('rechaza lastName con solo consonantes (sin vocal)', () => {
    const result = registerSchema.safeParse({ ...BASE_VALID, lastName: 'Xyz' });
    assert(result.success).toBeFalse();
    if (!result.success) {
      const issues = result.error.issues.filter((i) => i.path.includes('lastName'));
      assert(issues.length >= 1).toBeTrue();
    }
  });

  it('rechaza firstName "xxxxx"', () => {
    const result = registerSchema.safeParse({ ...BASE_VALID, firstName: 'xxxxx' });
    assert(result.success).toBeFalse();
  });

  it('acepta nombre con doble consonante válido (Lee)', () => {
    const result = registerSchema.safeParse({ ...BASE_VALID, firstName: 'Lee' });
    assert(result.success).toBeTrue();
  });

  it('acepta middleName vacío (opcional)', () => {
    const result = registerSchema.safeParse({ ...BASE_VALID, middleName: '' });
    assert(result.success).toBeTrue();
  });
});

// ─── Defecto 4: Zona horaria en fecha de nacimiento ──────────────────────────

describe('registerSchema — Defecto 4: parseo de fecha sin desfase UTC', () => {
  it('acepta la fecha "1990-01-01" exactamente (sin desfase UTC)', () => {
    const result = registerSchema.safeParse({ ...BASE_VALID, birthDate: '1990-01-01' });
    assert(result.success).toBeTrue();
  });

  it('rechaza una fecha futura independientemente de la zona horaria', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    const futureStr = `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}`;
    const result = registerSchema.safeParse({ ...BASE_VALID, birthDate: futureStr });
    assert(result.success).toBeFalse();
  });

  it('acepta una fecha exactamente 18 años atrás', () => {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${eighteenYearsAgo.getFullYear()}-${pad(eighteenYearsAgo.getMonth() + 1)}-${pad(eighteenYearsAgo.getDate())}`;
    const result = registerSchema.safeParse({ ...BASE_VALID, birthDate: dateStr });
    // La persona cumple 18 HOY — es válido
    assert(result.success).toBeTrue();
  });
});

// ─── Defecto 5: Límites de longitud en campos generales ──────────────────────

describe('registerSchema — Defecto 5: límites de longitud en campos generales', () => {
  it('rechaza firstName que supera 100 caracteres', () => {
    const result = registerSchema.safeParse({ ...BASE_VALID, firstName: 'a'.repeat(51) + 'b'.repeat(51) });
    assert(result.success).toBeFalse();
    if (!result.success) {
      const issues = result.error.issues.filter((i) => i.path.includes('firstName'));
      assert(issues.some((i) => i.message.includes('100'))).toBeTrue();
    }
  });

  it('rechaza document que supera 20 caracteres', () => {
    const result = registerSchema.safeParse({ ...BASE_VALID, document: 'A'.repeat(21) });
    assert(result.success).toBeFalse();
    if (!result.success) {
      const issues = result.error.issues.filter((i) => i.path.includes('document'));
      assert(issues.some((i) => i.message.includes('20'))).toBeTrue();
    }
  });
});
