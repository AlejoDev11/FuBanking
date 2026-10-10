import { When } from '@cucumber/cucumber';
import { Actor, actorCalled } from '@serenity-js/core';
import { PasswordResetViaApi } from '../../test/tasks/api/PasswordResetViaApi';

/**
 * Steps para el módulo de Restablecimiento de Contraseña.
 *
 * Los steps Given (preparación del actor) y Then (estado HTTP) se reutilizan.
 */

When('{pronoun} solicita restablecer la contraseña con su email', async (actor: Actor) => {
  await actor.attemptsTo(PasswordResetViaApi.requestWithOwnEmail());
});

When('alguien solicita restablecer la contraseña del email {string}', async (email: string) => {
  await actorCalled('Visitante').attemptsTo(
    PasswordResetViaApi.requestWithEmail(email),
  );
});

When('alguien verifica el token de restablecimiento {string}', async (token: string) => {
  await actorCalled('Visitante').attemptsTo(
    PasswordResetViaApi.verifyToken(token),
  );
});

When('alguien intenta restablecer la contraseña con token {string} y nueva contraseña {string}',
  async (token: string, newPassword: string) => {
    await actorCalled('Visitante').attemptsTo(
      PasswordResetViaApi.resetWithToken(token, newPassword),
    );
  });
