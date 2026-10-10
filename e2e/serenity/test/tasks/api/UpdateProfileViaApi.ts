import { Interaction, Task } from '@serenity-js/core';
import { CallAnApi } from '@serenity-js/rest';
import { clientNotes } from '../../support/ClientNotes';

/**
 * UpdateProfileViaApi: actualiza los datos del perfil del actor autenticado.
 */
export const UpdateProfileViaApi = {
  withName: (firstName: string, lastName: string) =>
    Task.where(`#actor actualiza su perfil con nombre "${ firstName } ${ lastName }"`,
      Interaction.where('#actor envía PATCH /profile', async actor => {
        const api = CallAnApi.as(actor);
        await api.request({
          method: 'PATCH',
          url: 'profile',
          data: { firstName, lastName },
        });
      }),
    ),

  withoutAuth: () =>
    Task.where('#actor intenta actualizar un perfil sin autenticación',
      Interaction.where('#actor envía PATCH /profile sin token', async actor => {
        const api = CallAnApi.as(actor);
        // Petición sin cabecera Authorization
        await api.request({
          method: 'PATCH',
          url: 'profile',
          data: { firstName: 'Sin', lastName: 'Auth' },
          headers: { Authorization: '' },
        });
      }),
    ),
};
