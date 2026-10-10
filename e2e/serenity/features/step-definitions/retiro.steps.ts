import { When } from '@cucumber/cucumber';
import { Actor } from '@serenity-js/core';
import { WithdrawMoney } from '../../test/tasks/api/WithdrawMoney';

/**
 * Steps para la funcionalidad de Retiro de Dinero.
 *
 * Los steps Given (preparación del actor) y Then (verificaciones)
 * se reutilizan desde cliente.steps.ts (estado HTTP, código de error, saldo).
 */
When('{pronoun} retira por API {int} de su cuenta', async (actor: Actor, amount: number) => {
  await actor.attemptsTo(
    WithdrawMoney.fromOwnAccount(amount),
  );
});

