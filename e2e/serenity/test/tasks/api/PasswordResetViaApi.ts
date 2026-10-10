import { Interaction, Task } from '@serenity-js/core';
import { CallAnApi } from '@serenity-js/rest';
import { clientNotes } from '../../support/ClientNotes';

/**
 * PasswordResetViaApi: flujo completo de restablecimiento de contraseña.
 */
export const PasswordResetViaApi = {
  requestWithOwnEmail: () =>
    Task.where('#actor solicita restablecer la contraseña con su email',
      Interaction.where('#actor envía POST auth/forgot-password', async actor => {
        const api = CallAnApi.as(actor);
        const email = await actor.answer(clientNotes().get('email'));
        await api.request({ method: 'POST', url: 'auth/forgot-password', data: { email } });
      }),
    ),

  requestWithEmail: (email: string) =>
    Task.where(`#actor solicita restablecer la contraseña del email ${ email }`,
      Interaction.where('#actor envía POST auth/forgot-password', async actor => {
        const api = CallAnApi.as(actor);
        await api.request({ method: 'POST', url: 'auth/forgot-password', data: { email } });
      }),
    ),

  verifyToken: (token: string) =>
    Task.where(`#actor verifica el token de restablecimiento "${ token }"`,
      Interaction.where('#actor envía GET auth/reset-password/verify', async actor => {
        const api = CallAnApi.as(actor);
        await api.request({ method: 'GET', url: `auth/reset-password/verify?token=${ token }` });
      }),
    ),

  resetWithToken: (token: string, newPassword: string) =>
    Task.where(`#actor restablece la contraseña con token inválido`,
      Interaction.where('#actor envía POST auth/reset-password', async actor => {
        const api = CallAnApi.as(actor);
        await api.request({ method: 'POST', url: 'auth/reset-password', data: { token, newPassword } });
      }),
    ),
};
