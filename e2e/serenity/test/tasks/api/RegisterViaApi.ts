import { Interaction, Task } from '@serenity-js/core';
import { CallAnApi } from '@serenity-js/rest';
import { uniqueClient } from '../../support/testData';
import { Credentials } from '../../support/Credentials';
import { clientNotes } from '../../support/ClientNotes';
import { ApiSuccess, SessionDto } from '../../support/apiTypes';

/**
 * RegisterViaApi: registra un nuevo cliente con datos aleatorios únicos.
 * Similar a BecomeClient pero sin abrir cuenta ni depositar, para probar
 * solo el endpoint de registro.
 */
export const RegisterViaApi = {
  withValidData: () =>
    Task.where('#actor se registra con datos válidos',
      Interaction.where('#actor envía POST auth/register con datos válidos', async actor => {
        const api = CallAnApi.as(actor);
        const data = uniqueClient(actor.name);
        const response = await api.request({ method: 'POST', url: 'auth/register', data });
        if (response.status === 201) {
          const { token } = (response.data as ApiSuccess<SessionDto>).data;
          Credentials.keep(actor, { password: data.password, token });
        }
        clientNotes().set('email', data.email);
      }),
    ),

  withEmail: (email: string) =>
    Task.where(`#actor intenta registrarse con el email ${ email }`,
      Interaction.where('#actor envía POST auth/register con email existente', async actor => {
        const api = CallAnApi.as(actor);
        const data = uniqueClient(actor.name);
        await api.request({ method: 'POST', url: 'auth/register', data: { ...data, email } });
      }),
    ),

  withPassword: (password: string) =>
    Task.where(`#actor intenta registrarse con contraseña débil`,
      Interaction.where('#actor envía POST auth/register con contraseña débil', async actor => {
        const api = CallAnApi.as(actor);
        const data = uniqueClient(actor.name);
        await api.request({ method: 'POST', url: 'auth/register', data: { ...data, password } });
      }),
    ),
};
