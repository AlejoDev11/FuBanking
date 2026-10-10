import { Interaction, Task } from '@serenity-js/core';
import { CallAnApi } from '@serenity-js/rest';
import { clientNotes } from '../../support/ClientNotes';
import { Credentials } from '../../support/Credentials';
import { ApiSuccess, SessionDto } from '../../support/apiTypes';

/**
 * LoginViaApi: autentica al actor con sus propias credenciales guardadas en Credentials.
 * Almacena el nuevo token en la cabecera Authorization del actor.
 */
export const LoginViaApi = {
  withOwnCredentials: () =>
    Task.where('#actor inicia sesión con sus credenciales correctas',
      Interaction.where('#actor envía sus credenciales a POST auth/login', async actor => {
        const api = CallAnApi.as(actor);
        const email = await actor.answer(clientNotes().get('email'));
        const password = await actor.answer(Credentials.password());
        const response = await api.request({ method: 'POST', url: 'auth/login', data: { email, password } });
        if (response.status === 200) {
          const { token } = (response.data as ApiSuccess<SessionDto>).data;
          api.modifyConfig(config => {
            config.headers.common.Authorization = `Bearer ${ token }`;
          });
        }
      }),
    ),

  withPassword: (password: string) =>
    Task.where(`#actor intenta iniciar sesión con una contraseña incorrecta`,
      Interaction.where('#actor envía credenciales a POST auth/login', async actor => {
        const api = CallAnApi.as(actor);
        const email = await actor.answer(clientNotes().get('email'));
        await api.request({ method: 'POST', url: 'auth/login', data: { email, password } });
      }),
    ),

  withCredentials: (email: string, password: string) =>
    Task.where(`#actor intenta iniciar sesión como ${ email }`,
      Interaction.where('#actor envía credenciales a POST auth/login', async actor => {
        const api = CallAnApi.as(actor);
        await api.request({ method: 'POST', url: 'auth/login', data: { email, password } });
      }),
    ),
};

