import { AfterAll, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { Cast, configure } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { CallAnApi } from '@serenity-js/rest';
import { Browser, chromium } from 'playwright';

import { startAppServer, stopAppServer } from '../../test/support/appServer';

let browser: Browser;

setDefaultTimeout(30_000);

BeforeAll(async () => {
  const baseUrl = await startAppServer();
  const apiOnly = process.env.SERENITY_API_ONLY === 'true';
  if (!apiOnly) {
    browser = await chromium.launch({
      headless: process.env.HEADLESS !== 'false',
    });
  }

  configure({
    actors: Cast.where(actor => {
      actor.whoCan(CallAnApi.at(baseUrl));
      if (browser) actor.whoCan(BrowseTheWebWithPlaywright.using(browser));
      return actor;
    }),
    crew: [
      '@serenity-js/console-reporter',
      ['@serenity-js/html-reporter', { specDirectory: './features' }],
    ],
  });
});

AfterAll(async () => {
  await browser?.close();
  await stopAppServer();
});
