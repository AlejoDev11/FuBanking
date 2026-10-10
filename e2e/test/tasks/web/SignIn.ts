import { endsWith } from '@serenity-js/assertions';
import { Duration, Task, Wait } from '@serenity-js/core';
import { Click, Enter, Navigate, Page } from '@serenity-js/web';

import { clientNotes } from '../../support/ClientNotes';
import { Credentials } from '../../support/Credentials';
import { LoginForm } from '../../ui/LoginForm';

/** Inicia sesión por el formulario con las credenciales que el actor anotó al registrarse. */
export const SignIn = {
  withOwnCredentials: () =>
    Task.where('#actor inicia sesión en FuBanking',
      Navigate.to('/login'),
      Enter.theValue(clientNotes().get('email')).into(LoginForm.email()),
      Enter.theValue(Credentials.password()).into(LoginForm.password()),
      Click.on(LoginForm.rememberMe()),
      Click.on(LoginForm.submit()),
      Wait.upTo(Duration.ofSeconds(30)).until(Page.current().url().pathname, endsWith('/profile')),
    ),
};
