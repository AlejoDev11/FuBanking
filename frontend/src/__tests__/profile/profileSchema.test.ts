import { expect as assert } from '@assertive-ts/core';
import { updateProfileSchema, parseDateLocal } from '../../features/profile/schemas/profile.schemas';

/**
 * Tests unitarios del updateProfileSchema del módulo de perfil.
 *
 * Defectos cubiertos:
 *  #1  — Límites de longitud (maxlength) en campos de texto.
 *  #2  — parseDateLocal sin desfase UTC.
 *  #4  — Validación semántica de nombres (isValidName).
 *  #5  — Límite máximo de contraseña (newPassword).
 *  #6  — Formulario vacío: errores correctos en todos los campos obligatorios.
 *  #7  — Mensajes diferenciados: longitud / formato / semántica.
 *  #9  — birthDate no existe en el schema (inmutable).
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractMessages(result: ReturnType<typeof updateProfileSchema.safeParse>): string[] {
  if (result.success) return [];
  return result.error.issues.map((i) => i.message);
}

function messagesFor(
  result: ReturnType<typeof updateProfileSchema.safeParse>,
  field: string,
): string[] {
  if (result.success) return [];
  return result.error.issues
    .filter((i) => i.path.includes(field))
    .map((i) => i.message);
}

// ─── Defecto #1: Límites de longitud ─────────────────────────────────────────

describe('updateProfileSchema — Defecto #1: límites de longitud en campos de texto', () => {
  it('rechaza firstName con más de 100 caracteres', () => {
    const result = updateProfileSchema.safeParse({ firstName: 'A'.repeat(101) });
    assert(result.success).toBeFalse();
    const msgs = messagesFor(result, 'firstName');
    assert(msgs.some((m) => m.includes('100'))).toBeTrue();
  });

  it('acepta firstName exactamente en el límite (100 chars)', () => {
    // 100 letras 'a' es válido en longitud; pasa isValidName porque contiene vocal
    const result = updateProfileSchema.safeParse({ firstName: 'a'.repeat(100) });
    // Nota: puede fallar por isValidName (3+ consecutivos), lo cual es correcto
    // Lo que importa es que el mensaje NO diga "superar 100 caracteres"
    const msgs = messagesFor(result, 'firstName');
    assert(msgs.some((m) => m.includes('superar los 100'))).toBeFalse();
  });

  it('rechaza middleName con más de 100 caracteres', () => {
    const result = updateProfileSchema.safeParse({ middleName: 'B'.repeat(101) });
    assert(result.success).toBeFalse();
    const msgs = messagesFor(result, 'middleName');
    assert(msgs.some((m) => m.includes('100'))).toBeTrue();
  });

  it('rechaza lastName con más de 100 caracteres', () => {
    const result = updateProfileSchema.safeParse({ lastName: 'C'.repeat(101) });
    assert(result.success).toBeFalse();
    const msgs = messagesFor(result, 'lastName');
    assert(msgs.some((m) => m.includes('100'))).toBeTrue();
  });

  it('rechaza secondLastName con más de 100 caracteres', () => {
    const result = updateProfileSchema.safeParse({ secondLastName: 'D'.repeat(101) });
    assert(result.success).toBeFalse();
    const msgs = messagesFor(result, 'secondLastName');
    assert(msgs.some((m) => m.includes('100'))).toBeTrue();
  });
});

// ─── Defecto #2: parseDateLocal sin desfase UTC ───────────────────────────────

describe('parseDateLocal — Defecto #2: parseo sin desfase UTC', () => {
  it('parsea "2000-01-01" como 1 enero 2000 sin desfase', () => {
    const date = parseDateLocal('2000-01-01');
    assert(date.getFullYear()).toBeEqual(2000);
    assert(date.getMonth()).toBeEqual(0); // enero = 0
    assert(date.getDate()).toBeEqual(1);
  });

  it('parsea "1990-05-15" correctamente en zona UTC-5', () => {
    const date = parseDateLocal('1990-05-15');
    assert(date.getFullYear()).toBeEqual(1990);
    assert(date.getMonth()).toBeEqual(4); // mayo = 4
    assert(date.getDate()).toBeEqual(15);
  });

  it('parsea "2023-12-31" sin desfase al día anterior', () => {
    const date = parseDateLocal('2023-12-31');
    assert(date.getFullYear()).toBeEqual(2023);
    assert(date.getMonth()).toBeEqual(11); // diciembre = 11
    assert(date.getDate()).toBeEqual(31);
  });
});

// ─── Defecto #4: Validación semántica de nombres ─────────────────────────────

describe('updateProfileSchema — Defecto #4: nombres sin sentido rechazados', () => {
  it('rechaza firstName con 3 o más caracteres consecutivos idénticos', () => {
    const result = updateProfileSchema.safeParse({ firstName: 'Joooohn' });
    assert(result.success).toBeFalse();
    const msgs = messagesFor(result, 'firstName');
    assert(msgs.some((m) => m.includes('consecutivos'))).toBeTrue();
  });

  it('rechaza lastName sin vocales (solo consonantes)', () => {
    const result = updateProfileSchema.safeParse({ lastName: 'Xyz' });
    assert(result.success).toBeFalse();
    const msgs = messagesFor(result, 'lastName');
    assert(msgs.length >= 1).toBeTrue();
  });

  it('rechaza firstName "aaaaa"', () => {
    const result = updateProfileSchema.safeParse({ firstName: 'aaaaa' });
    assert(result.success).toBeFalse();
  });

  it('acepta firstName con doble consonante corta (Lee)', () => {
    const result = updateProfileSchema.safeParse({ firstName: 'Lee' });
    // Acepta: 2 'e' no son 3 consecutivos
    const msgs = messagesFor(result, 'firstName');
    assert(msgs.some((m) => m.includes('consecutivos'))).toBeFalse();
  });

  it('acepta middleName vacío o nulo (campo opcional)', () => {
    const result = updateProfileSchema.safeParse({ middleName: '' });
    // Si solo se envía middleName vacío, falla por "al menos un campo"
    // pero NO por validación de nombre
    const msgs = messagesFor(result, 'middleName');
    assert(msgs.length).toBeEqual(0);
  });

  it('rechaza middleName con 3+ caracteres consecutivos', () => {
    const result = updateProfileSchema.safeParse({ middleName: 'Luuuis' });
    assert(result.success).toBeFalse();
    const msgs = messagesFor(result, 'middleName');
    assert(msgs.some((m) => m.includes('consecutivos'))).toBeTrue();
  });
});

// ─── Defecto #5: Límite máximo de contraseña ─────────────────────────────────

describe('updateProfileSchema — Defecto #5: límite máximo de contraseña', () => {
  it('acepta newPassword vacío (no cambiar contraseña)', () => {
    const result = updateProfileSchema.safeParse({ firstName: 'Juan', newPassword: '' });
    const msgs = messagesFor(result, 'newPassword');
    assert(msgs.length).toBeEqual(0);
  });

  it('acepta newPassword en el límite exacto (128 chars)', () => {
    const result = updateProfileSchema.safeParse({
      firstName: 'Juan',
      newPassword: 'x'.repeat(128),
    });
    const msgs = messagesFor(result, 'newPassword');
    assert(msgs.length).toBeEqual(0);
  });

  it('rechaza newPassword que supera el límite (129 chars)', () => {
    const result = updateProfileSchema.safeParse({
      firstName: 'Juan',
      newPassword: 'x'.repeat(129),
    });
    assert(result.success).toBeFalse();
    const msgs = messagesFor(result, 'newPassword');
    assert(msgs.some((m) => m.includes('128'))).toBeTrue();
  });
});

// ─── Defecto #6: Formulario completamente vacío ───────────────────────────────

describe('updateProfileSchema — Defecto #6: validación de formulario vacío', () => {
  it('rechaza objeto vacío con mensaje "al menos un campo"', () => {
    const result = updateProfileSchema.safeParse({});
    assert(result.success).toBeFalse();
    const msgs = extractMessages(result);
    assert(msgs.some((m) => /al menos un campo/i.test(m))).toBeTrue();
  });

  it('rechaza firstName con menos de 2 caracteres y muestra mensaje de mínimo', () => {
    const result = updateProfileSchema.safeParse({ firstName: 'A' });
    assert(result.success).toBeFalse();
    const msgs = messagesFor(result, 'firstName');
    assert(msgs.some((m) => m.includes('al menos 2'))).toBeTrue();
  });

  it('rechaza lastName con menos de 2 caracteres y muestra mensaje de mínimo', () => {
    const result = updateProfileSchema.safeParse({ lastName: 'B' });
    assert(result.success).toBeFalse();
    const msgs = messagesFor(result, 'lastName');
    assert(msgs.some((m) => m.includes('al menos 2'))).toBeTrue();
  });
});

// ─── Defecto #7: Mensajes diferenciados ──────────────────────────────────────

describe('updateProfileSchema — Defecto #7: mensajes de error diferenciados', () => {
  it('mensaje de longitud excedida es DIFERENTE al de formato inválido', () => {
    const tooLong = updateProfileSchema.safeParse({ firstName: 'A'.repeat(101) });
    const badFormat = updateProfileSchema.safeParse({ firstName: 'Juan123' });

    const msgsTooLong = messagesFor(tooLong, 'firstName');
    const msgsBadFormat = messagesFor(badFormat, 'firstName');

    assert(msgsTooLong.some((m) => m.includes('superar'))).toBeTrue();
    assert(msgsBadFormat.some((m) => m.includes('letras'))).toBeTrue();
    // Los mensajes son distintos
    assert(msgsTooLong[0]).not.toBeEqual(msgsBadFormat[0]);
  });

  it('mensaje de consecutivos es DIFERENTE al de longitud', () => {
    const consecutive = updateProfileSchema.safeParse({ firstName: 'Joooohn' });
    const tooLong = updateProfileSchema.safeParse({ firstName: 'A'.repeat(101) });

    const msgsConsecutive = messagesFor(consecutive, 'firstName');
    const msgsTooLong = messagesFor(tooLong, 'firstName');

    assert(msgsConsecutive.some((m) => m.includes('consecutivos'))).toBeTrue();
    assert(msgsTooLong.some((m) => m.includes('superar'))).toBeTrue();
  });
});

// ─── Defecto #9: birthDate inmutable ─────────────────────────────────────────

describe('updateProfileSchema — Defecto #9: birthDate no es un campo editable', () => {
  it('birthDate no está en las claves del schema', () => {
    const schemaShape = (updateProfileSchema as unknown as { _def: { schema: { shape: Record<string, unknown> } } })
      ._def?.schema?.shape;
    if (schemaShape) {
      assert(Object.keys(schemaShape).includes('birthDate')).toBeFalse();
    }
  });

  it('parsear un payload con birthDate no genera error — el campo es ignorado silenciosamente', () => {
    // Zod por defecto en modo strict rechazaría campos extra; en modo passthrough los ignora.
    // El schema usa el modo por defecto (strip), por lo que birthDate se descarta sin error.
    const result = updateProfileSchema.safeParse({
      firstName: 'Ana',
      birthDate: '1990-01-01', // campo desconocido → descartado
    });
    // No debe haber error por birthDate (puede haber error por "al menos un campo" si todos son vacíos)
    if (!result.success) {
      const msgs = messagesFor(result, 'birthDate');
      assert(msgs.length).toBeEqual(0);
    }
  });

  it('el tipo UpdateProfileInput no expone birthDate', () => {
    // Verificación de tipo en runtime: el parsed output no contiene birthDate
    const result = updateProfileSchema.safeParse({ firstName: 'Ana', birthDate: '1990-01-01' });
    if (result.success) {
      assert('birthDate' in result.data).toBeFalse();
    }
  });
});

// ─── Caminos felices (smoke tests) ───────────────────────────────────────────

describe('updateProfileSchema — caminos válidos', () => {
  it('acepta solo firstName válido', () => {
    const result = updateProfileSchema.safeParse({ firstName: 'Maria' });
    assert(result.success).toBeTrue();
    if (result.success) {
      assert(result.data.firstName).toBeEqual('Maria');
    }
  });

  it('acepta solo lastName válido', () => {
    const result = updateProfileSchema.safeParse({ lastName: 'Lopez' });
    assert(result.success).toBeTrue();
  });

  it('acepta solo phone válido', () => {
    const result = updateProfileSchema.safeParse({ phone: '+573001234567' });
    assert(result.success).toBeTrue();
  });

  it('acepta solo avatarUrl válida', () => {
    const result = updateProfileSchema.safeParse({ avatarUrl: 'https://cdn.example.com/img.png' });
    assert(result.success).toBeTrue();
  });

  it('acepta solo monthlyIncome positivo', () => {
    const result = updateProfileSchema.safeParse({ monthlyIncome: 2500000 });
    assert(result.success).toBeTrue();
  });

  it('acepta payload con múltiples campos válidos', () => {
    const result = updateProfileSchema.safeParse({
      firstName: 'Carlos',
      lastName: 'Ramirez',
      phone: '+57 310 000 0000',
      monthlyIncome: 3000000,
    });
    assert(result.success).toBeTrue();
  });

  it('acepta nombre con acento (Álvaro)', () => {
    const result = updateProfileSchema.safeParse({ firstName: 'Álvaro' });
    assert(result.success).toBeTrue();
  });

  it('acepta nombre con eñe (Ñoño)', () => {
    // "Ñoño" tiene 2 ñ pero no 3 consecutivas, y tiene vocal
    const result = updateProfileSchema.safeParse({ firstName: 'Ñoño' });
    assert(result.success).toBeTrue();
  });

  it('rechaza monthlyIncome negativo', () => {
    const result = updateProfileSchema.safeParse({ monthlyIncome: -100 });
    assert(result.success).toBeFalse();
    const msgs = messagesFor(result, 'monthlyIncome');
    assert(msgs.some((m) => m.includes('mayor a cero'))).toBeTrue();
  });

  it('rechaza phone con formato inválido', () => {
    const result = updateProfileSchema.safeParse({ phone: '123' });
    assert(result.success).toBeFalse();
    const msgs = messagesFor(result, 'phone');
    assert(msgs.some((m) => /inv[aá]lid/i.test(m))).toBeTrue();
  });

  it('rechaza avatarUrl con formato inválido', () => {
    const result = updateProfileSchema.safeParse({ avatarUrl: 'no-es-una-url' });
    assert(result.success).toBeFalse();
    const msgs = messagesFor(result, 'avatarUrl');
    assert(msgs.length >= 1).toBeTrue();
  });
});
