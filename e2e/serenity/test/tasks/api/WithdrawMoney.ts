import { q, Task } from '@serenity-js/core';
import { PostRequest, Send } from '@serenity-js/rest';
import { clientNotes } from '../../support/ClientNotes';

export const WithdrawMoney = {
  fromOwnAccount: (amount: unknown) =>
    Task.where(`#actor intenta retirar ${ JSON.stringify(amount) } de su cuenta`,
      Send.a(PostRequest.to(q`accounts/${ clientNotes().get('accountId') }/withdraw`).with({ amount })),
    ),
};
